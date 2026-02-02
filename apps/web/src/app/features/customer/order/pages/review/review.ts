import { Component } from '@angular/core';
import { OrderDraft } from '../../services/order-draft';
import { CommonModule } from '@angular/common';
import { Observable, of, switchMap, take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Voucher } from '../../services/voucher';
import { Router } from '@angular/router';
import  { RestaurantHeader } from '../../../restaurant/components/restaurant-header/restaurant-header';
import { RestaurantService } from '../../../restaurant/restaurant.service';
import { Restaurant } from '../../../restaurant/restaurant.model';
import { OrderDraftDto } from '../../dto/orderDraftDTO';

@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, RestaurantHeader],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {

  constructor(public orderDraftService: OrderDraft, private voucherService: Voucher, private router: Router, private restaurantService: RestaurantService) {
    this.draft$ = this.orderDraftService.draft$;
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
  appliedVoucher$;

  restaurant$ : Observable<Restaurant | null>;

  checkVoucher() {
    if (!this.voucherCode) return;
    if (!this.voucherCode.trim()) return;
    this.voucherService.checkVoucher(this.voucherCode);
    if(this.voucherService.appliedVoucher$){
      this.orderDraftService.setVoucherCode(this.voucherCode);
    }
  }

  goToPayment() {
    this.router.navigate(['/order/payment']);
  }

  onInputChange() {
    this.voucherService.changeVoucherState();
  }

}