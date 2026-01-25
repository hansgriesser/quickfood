import { Injectable } from '@angular/core';
import { OrderService } from './order';
import { CartService } from '../../cart/services/cart';
import { OrderDraft } from './order-draft';
import { OrderDraftDto } from '../orderDTO';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private draftService: OrderDraft
  ) {}

  placeOrder() {

    const draft = this.draftService.getDraft();

    return this.orderService.placeOrder(draft).pipe(
      tap(() => {
        this.cartService.clearCart();
        this.draftService.clearDraft();
      })
    );
  }
}
