import { Injectable } from '@angular/core';
import { OrderDraftDto, OrderDto, OrderStatus } from '../orderDTO';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY, interval, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {

  private baseUrl = 'http://localhost:3000/api/order'
  
  constructor(private http: HttpClient) {}

  private orderSubject = new BehaviorSubject<OrderDto | null>(null);
  readonly order$ = this.orderSubject.asObservable();

  private destroy$ = new Subject<void>();

  placeOrder(orderDraft: OrderDraftDto) {
    console.log('Preparing to place order with draft:', orderDraft);
    const order : Partial<OrderDto> = this.mapToOrderDto(orderDraft);
    console.log('Placing order:', order);
    return this.http.post<OrderDto>(`${this.baseUrl}`, order).pipe(
      tap(createdOrder => {
        this.orderSubject.next(createdOrder);
      })
    );
  }

  updateOrder(){
    const orderId = this.orderSubject.value?.id;

    if (!orderId) {
      return EMPTY;
    }
    return this.http.get<OrderDto>(`${this.baseUrl}/${orderId}`).pipe(
      tap(updatedOrder => {
        this.orderSubject.next(updatedOrder);
      })
    );
  }

  
  private mapToOrderDto(draft: OrderDraftDto): Partial<OrderDto> {
    return {
      restaurantId: draft.restaurantId,
      customerId: 0,//draft.customerId, // muss gültig sein
      status: OrderStatus.PENDING,
      voucherCode: draft.voucherCode ?? null,
      items: draft.items.map(item => ({
        dishId: item.dishId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
        // id, orderId, createdAt weglassen → Backend setzt
      }))
    };
  }

  startPolling() {
    interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.updateOrder()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  stopPolling() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
