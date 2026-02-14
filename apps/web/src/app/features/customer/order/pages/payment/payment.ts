import { Component } from '@angular/core';
import { OrderDraft } from '../../services/order-draft';
import { Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout-service';

@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  constructor(
    private checkoutService: CheckoutService,
    private router: Router,
  ) {}

  placeOrder() {
    this.checkoutService.placeOrder().subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        this.router.navigate(['/order/confirmation']);
      },
      error: (error) => {
        console.error('Error placing order:', error);
        // Handle error
      },
    });
  }
}
