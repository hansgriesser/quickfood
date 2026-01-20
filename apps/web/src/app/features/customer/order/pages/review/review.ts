import { Component } from '@angular/core';
import { OrderDraft } from '../../services/order-draft';
import { CommonModule } from '@angular/common';
import { OrderDraftDto } from '../../orderDTO';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Voucher } from '../../services/voucher';

@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {

  constructor(private orderDraftService: OrderDraft, private voucherService: Voucher) {
    this.draft$ = this.orderDraftService.draft$;
    this.subtotalAmount$ = this.orderDraftService.subtotalAmount;
    this.discountAmount$ = this.orderDraftService.discountAmount;
    this.totalAmount$ = this.orderDraftService.totalAmount;
    this.voucherState$ = this.voucherService.voucherState$;
    this.appliedVoucher$ = this.voucherService.appliedVoucher$;
  }  
  
  voucherCode: string = '';
  voucherState$ : Observable<'idle' | 'checking' | 'valid' | 'invalid'>;
  draft$ : Observable<OrderDraftDto>;
  subtotalAmount$ = 0;
  discountAmount$ = 0;
  totalAmount$ = 0;
  appliedVoucher$;

  checkVoucher() {
    if (!this.voucherCode) return;
    this.voucherService.checkVoucher(this.voucherCode);
  }

  goToPayment() {
    console.log('Navigating to payment...');
  }

}
