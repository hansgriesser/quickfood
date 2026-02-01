import { Injectable } from '@angular/core';
import { OrderDraftDto, OrderDto, OrderStatus } from '../orderDTO';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderService {

  private baseUrl = 'http://localhost:3000/api/order'
  
  constructor(private http: HttpClient) {}

  placeOrder(orderDraft: OrderDraftDto) {
    const order = this.mapToOrderDto(orderDraft);
    return this.http.post<OrderDto>(`${this.baseUrl}`, order);
  }

  getOrder(orderId: string){
    return this.http.get<OrderDto>(`${this.baseUrl}/${orderId}`);
  }
  
  private mapToOrderDto(draft: OrderDraftDto): Partial<OrderDto> {
    return {
      restaurantId: draft.restaurantId,
      customerId: 0,//wird im backend aus dem token geparst
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
