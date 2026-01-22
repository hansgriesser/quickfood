import { Component } from '@angular/core';
import { OrderDraft } from '../../services/order-draft';
import { CommonModule } from '@angular/common';
import { OrderDraftDto } from '../../orderDTO';
import { Observable, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Voucher } from '../../services/voucher';
import { Router } from '@angular/router';
import  { RestaurantHeader } from '../../../restaurant/components/restaurant-header/restaurant-header';
import { RestaurantService } from '../../../restaurant/restaurant.service';
import { Restaurant } from '../../../restaurant/restaurant.model';

@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, RestaurantHeader],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {

  constructor(private orderDraftService: OrderDraft, private voucherService: Voucher, private router: Router, private restaurantService: RestaurantService) {
    this.draft$ = this.orderDraftService.draft$;
    this.subtotalAmount$ = this.orderDraftService.subtotalAmount;
    this.discountAmount$ = this.orderDraftService.discountAmount;
    this.totalAmount$ = this.orderDraftService.totalAmount;
    this.voucherState$ = this.voucherService.voucherState$;
    this.appliedVoucher$ = this.voucherService.appliedVoucher$;
    
    this.restaurant$ = this.orderDraftService.restaurantId$.pipe(
          switchMap(id =>
            id ? this.restaurantService.getRestaurantById(id) : of(null)
          )
        );
  }  
  
  voucherCode: string = '';
  voucherState$ : Observable<'idle' | 'checking' | 'valid' | 'invalid'>;
  draft$ : Observable<OrderDraftDto>;
  subtotalAmount$ = 0;
  discountAmount$ = 0;
  totalAmount$ = 0;
  appliedVoucher$;

  restaurant$ : Observable<Restaurant | null>;

  checkVoucher() {
    if (!this.voucherCode) return;
    this.voucherService.checkVoucher(this.voucherCode);
  }

  goToPayment() {
    console.log('Navigating to payment...');
    this.router.navigate(['/order/payment']);
  }

}