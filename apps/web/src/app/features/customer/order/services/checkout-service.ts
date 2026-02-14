import { Injectable } from '@angular/core';
import { CartService } from '../../cart/services/cart';
import { OrderDraft } from './order-draft';
import { tap } from 'rxjs';
import { ActiveOrderService } from './order-session';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(
    private activeOrderService: ActiveOrderService,
    private cartService: CartService,
    private draftService: OrderDraft,
  ) {}

  placeOrder() {
    const draft = this.draftService.getDraft();

    return this.activeOrderService.createOrder(draft).pipe(
      tap(() => {
        this.cartService.clearCart();
        this.draftService.clearDraft();
      }),
    );
  }
}
