import { Injectable } from '@angular/core';
import { OrderDraftDto, OrderItemDto } from '../orderDTO';
import { CartDto, CartItemDto } from '../../cart/cartDTO';
import { OrderService } from './order';
import { Voucher } from './voucher';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderDraft {

  constructor(private orderService: OrderService, private voucherService: Voucher) {}

  private draftSubject = new BehaviorSubject<OrderDraftDto>({
    restaurantId: '',
    items: []
  });
  draft$ = this.draftSubject.asObservable();

  prepareOrder(cart : CartDto) {
      const items = this.getOrderItems(cart.items);
      const order : OrderDraftDto = {
        restaurantId: cart.restaurantId,
        items: items,
      };
      console.log('Preparing order:', order);
      this.draftSubject.value.restaurantId = order.restaurantId;
      this.draftSubject.value.items = order.items;
  }

  private getOrderItems(items: CartItemDto[]): OrderItemDto[] {
      console.log('Generating order items from subject:', items);
  
      return items.map(item => ({
        id: 0,
        orderId: '',
        dishId: item.dishId,
        name: item.name,
        unitPrice: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
        createdAt: new Date().toISOString(),
      }));
  }

  placeOrder() {
    return this.orderService.placeOrder(this.draftSubject.value);
  }

  // Getters for calculated amounts
  
  get subtotalAmount(): number {
     return this.draftSubject.value.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  }
  
  get discountAmount(): number {
    return this.voucherService.getDiscountAmount(this.subtotalAmount);
  }
  
  
  get totalAmount(): number {
    return this.subtotalAmount - this.discountAmount;    
  }
  
}
