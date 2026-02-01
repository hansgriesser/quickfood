import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, interval, startWith, switchMap, EMPTY, takeUntil, tap } from "rxjs";
import { OrderDraftDto, OrderDto, OrderStatus } from "../orderDTO";
import { OrderService } from "./order";

@Injectable({ providedIn: 'root' })
export class ActiveOrderService {
  private orderSubject = new BehaviorSubject<OrderDto | null>(null);
  readonly order$ = this.orderSubject.asObservable();

  private destroy$ = new Subject<void>();

  hasDiscount = this.orderSubject.value?.discountAmount !== 0;

  constructor(private orderService: OrderService) {}

  createOrder(draft: OrderDraftDto) {
    return this.orderService.placeOrder(draft).pipe(
      tap(order => this.setActiveOrder(order))
    );
  }

  get orderId(): string | null {
    return this.orderSubject.value?.id ?? null;
  }

  private startPolling() {
    interval(10_000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.orderId
            ? this.orderService.getOrder(this.orderId)
            : EMPTY
        ),
        tap(order => {
          if(order.status === OrderStatus.DELIVERED){
            this.stopPolling();
          }
        }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(order => this.orderSubject.next(order));
  }

  clear() {
    this.destroy$.next();
    this.destroy$.complete();
    this.orderSubject.next(null);
  }  
  
  private setActiveOrder(order: OrderDto) {
    this.orderSubject.next(order);
    this.startPolling();
  }

  private stopPolling() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
