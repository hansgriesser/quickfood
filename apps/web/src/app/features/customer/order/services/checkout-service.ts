import { Injectable, inject } from '@angular/core';
import { CartService } from '../../cart/services/cart';
import { OrderDraft } from './order-draft';
import { tap } from 'rxjs';
import { ActiveOrderService } from './order-session';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private activeOrderService = inject(ActiveOrderService);
  private cartService = inject(CartService);
  private draftService = inject(OrderDraft);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

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
