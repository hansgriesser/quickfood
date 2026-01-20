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
    const order : OrderDto = this.mapToOrderDto(orderDraft);
    console.log('Sending order to server:', order);
    return this.http.post(`${this.baseUrl}`, order)
    .pipe(
      tap({
        next: (res) => console.log('Server response:', res),
        error: (err) => console.error('HTTP Error:', err)
      })
    );
  }

  
  //Hilfsfunktionen
  mapToOrderDto(draft: OrderDraftDto): OrderDto {
    return {
      id: '', //wird vom Server gesetzt
      restaurantId: draft.restaurantId,
      customerId: 0, //wird vom Server gesetzt
      status: OrderStatus.PENDING,
      items: draft.items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      voucherCode: draft.voucherCode
    };
  }

}
