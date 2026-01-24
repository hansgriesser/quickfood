import { Component } from '@angular/core';
import { OrderDraft } from '../../services/order-draft';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {

  constructor(private orderDraftService: OrderDraft, private router : Router) {}
  
  placeOrder() {
    this.orderDraftService.placeOrder().subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        this.router.navigate(['/order/confirmation']);
      },
      error: (error) => {
        console.error('Error placing order:', error);
        // Handle error
      }
    });
  }
}
