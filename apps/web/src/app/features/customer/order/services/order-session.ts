import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, interval, startWith, switchMap, EMPTY, takeUntil, tap } from "rxjs";
import { OrderService } from "./order";
import { OrderDraftDto } from "../dto/orderDraftDTO";
import { ActiveOrder, OrderDto } from "../dto/orderDTO";
import { OrderStatus } from "../dto/orderStatus";

const ACTIVE_ORDER_KEY = 'active_order';
const CART_KEY = 'cart';
const ORDER_DRAFT_KEY = 'orderDraft';

@Injectable({ providedIn: 'root' })
export class ActiveOrderService {
  private orderSubject = new BehaviorSubject<OrderDto | null>(null);
  readonly order$ = this.orderSubject.asObservable();

  private destroy$ = new Subject<void>();

  hasDiscount = this.orderSubject.value?.discountAmount !== 0;

  constructor(private orderService: OrderService) {
    this.restoreActiveOrder();
  }

  createOrder(draft: OrderDraftDto) {
    return this.orderService.placeOrder(draft).pipe(
      tap(order => {
        this.setActiveOrder(order);
        this.clearCartData();
      })
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
            this.clearCachedOrder();
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
    this.stopPolling();
    this.clearCachedOrder();
  }  
  
  private setActiveOrder(order: OrderDto) {
    this.orderSubject.next(order);
    localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify({ id: order.id, status: order.status }));
    this.startPolling();
  }

  private stopPolling() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private restoreActiveOrder() {
    const raw = localStorage.getItem(ACTIVE_ORDER_KEY);
    if(!raw) return;

    const activeOrer: ActiveOrder = JSON.parse(raw);
    this.orderSubject.next({ id: activeOrer.id, status: activeOrer.status } as OrderDto);
    this.startPolling();
  }

  private clearCachedOrder() {
    localStorage.removeItem(ACTIVE_ORDER_KEY);
  }

  private clearCartData() {
    console.log('Clearing cart data from localStorage');
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(ORDER_DRAFT_KEY);
  }
}
