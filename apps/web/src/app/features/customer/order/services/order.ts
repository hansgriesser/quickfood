import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderDraftDto } from '../dto/orderDraftDTO';
import { OrderDto } from '../dto/orderDTO';
import { OrderStatus } from '../dto/orderStatus';
import { CreateOrderDto } from '../dto/sendOrderDTO';

@Injectable({
  providedIn: 'root',
})
export class OrderService {

  private baseUrl = 'http://localhost:3000/api/order'
  
  constructor(private http: HttpClient) {}

  placeOrder(orderDraft: OrderDraftDto) {
    const order = this.mapToCreateOrderDto(orderDraft);
    return this.http.post<OrderDto>(`${this.baseUrl}`, order);
  }

  getOrder(orderId: string){
    return this.http.get<OrderDto>(`${this.baseUrl}/${orderId}`);
  }
  
  private mapToCreateOrderDto(draft: OrderDraftDto): CreateOrderDto {
    return {
      restaurantId: draft.restaurantId,
      voucherCode: draft.voucherCode,
      items: draft.items.map(item => ({
        dishId: item.dishId!,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    };
  }
}
