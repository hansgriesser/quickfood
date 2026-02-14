import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, timer, exhaustMap, catchError, finalize, of } from 'rxjs';
import { OwnerOrdersService } from '../../services/owner-orders.service';
import { OwnerOrder, OrderStatus, OrderStatusLabel } from '../../services/owner-order.model';
import { ChatService } from '../../../chat/services/chat-service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-owner-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-orders.component.html',
  styleUrls: ['./owner-orders.component.css'],
})
export class OwnerOrdersComponent implements OnInit, OnDestroy {
  orders: OwnerOrder[] = [];
  orders$!: Observable<OwnerOrder[]>;
  isLoading = false;
  errorMessage = '';

  readonly orderStatus = OrderStatus;
  readonly statusLabels = OrderStatusLabel;
  totalUnreadMessages$: Observable<number>;

  private readonly sub = new Subscription();
  private readonly busyOrders = new Set<string>();

  constructor(
    private ownerOrdersService: OwnerOrdersService,
    private cdr: ChangeDetectorRef,
    private chatService: ChatService,
  ) {
    this.totalUnreadMessages$ = this.chatService.totalUnreadMessages$;
  }

  ngOnInit(): void {
    this.startPolling();
    this.chatService.openChatForOwner();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  trackByOrderId(_: number, order: OwnerOrder): string {
    return order.id;
  }

  statusLabel(status: OrderStatus): string {
    return this.statusLabels[status] ?? status;
  }

  statusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'pending';
      case OrderStatus.ACCEPTED:
        return 'accepted';
      case OrderStatus.PREPARING:
        return 'preparing';
      case OrderStatus.READY:
        return 'ready';
      case OrderStatus.DISPATCHED:
        return 'dispatched';
      case OrderStatus.REJECTED:
        return 'rejected';
      case OrderStatus.CANCELLED:
        return 'cancelled';
      case OrderStatus.COMPLETED:
        return 'completed';
      default:
        return '';
    }
  }

  isBusy(orderId: string): boolean {
    return this.busyOrders.has(orderId);
  }

  acceptOrder(order: OwnerOrder): void {
    this.runOrderAction(order.id, this.ownerOrdersService.acceptOrder(order.id));
  }

  rejectOrder(order: OwnerOrder): void {
    this.runOrderAction(order.id, this.ownerOrdersService.rejectOrder(order.id));
  }

  updateStatus(order: OwnerOrder, status: OrderStatus): void {
    this.runOrderAction(order.id, this.ownerOrdersService.updateStatus(order.id, status));
  }

  private startPolling(): void {
    this.orders$ = timer(0, 5000).pipe(
      exhaustMap(() => {
        if (!this.isLoading) {
          this.isLoading = true;
        }

        return this.ownerOrdersService.listOrders().pipe(
          catchError(() => {
            this.errorMessage = 'Could not load orders.';
            return of([] as OwnerOrder[]);
          }),
          finalize(() => {
            this.isLoading = false;
          }),
        );
      }),
    );
  }

  private runOrderAction(actionOrderId: string, request$: Observable<OwnerOrder>) {
    if (this.busyOrders.has(actionOrderId)) return;

    this.busyOrders.add(actionOrderId);
    this.errorMessage = '';

    const actionSub = request$
      .pipe(
        finalize(() => {
          this.busyOrders.delete(actionOrderId);
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (updated: OwnerOrder) => {
          this.upsertOrder(updated);
        },
        error: () => {
          this.errorMessage = 'Could not update order.';
          this.cdr.detectChanges();
        },
      });

    this.sub.add(actionSub);
  }

  private upsertOrder(updated: OwnerOrder): void {
    const index = this.orders.findIndex((order) => order.id === updated.id);
    if (index === -1) {
      this.orders = [updated, ...this.orders];
      return;
    }

    this.orders = [...this.orders.slice(0, index), updated, ...this.orders.slice(index + 1)];
  }

  //für Extra Task User: Chat

  openChat(orderId: string) {
    this.chatService.openChat(orderId);
  }

  unreadCountForOrder(orderId: string) {
    return this.chatService.getUnreadCountForOrder(orderId) ?? 0;
  }
}
