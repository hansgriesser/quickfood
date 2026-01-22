import { Injectable } from '@angular/core';
import { OrderDraftDto, OrderDto, OrderStatus } from '../orderDTO';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {

  private baseUrl = 'http://localhost:3000/api/order'
  
  constructor(private http: HttpClient) {}

  placeOrder(orderDraft: OrderDraftDto) {
    console.log('Preparing to place order with draft:', orderDraft);
    const order : Partial<OrderDto> = this.mapToOrderDto(orderDraft);
    console.log('Placing order:', order);
    return this.http.post(`${this.baseUrl}`, order);
  }

  
  mapToOrderDto(draft: OrderDraftDto): Partial<OrderDto> {
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


}
