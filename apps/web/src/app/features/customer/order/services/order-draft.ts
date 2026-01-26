import { Injectable } from '@angular/core';
import { OrderDraftDto, OrderItemDto } from '../orderDTO';
import { CartDto, CartItemDto } from '../../cart/cartDTO';
import { Voucher } from './voucher';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { ServiceFeeService } from './service-fee';

@Injectable({
  providedIn: 'root',
})
export class OrderDraft {

  private readonly STORAGE_KEY = 'orderDraft';

  subtotalAmount$: Observable<number>;
  discountAmount$: Observable<number>;
  feeAmount$: Observable<number>;
  totalAmount$: Observable<number>;

  constructor(
    private voucherService: Voucher,
    private feeService: ServiceFeeService
  ) {
    // Lade gespeicherten Draft
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.draftSubject.next(JSON.parse(saved));
    }

    this.draft$
      .pipe(distinctUntilChanged())
      .subscribe(draft =>
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(draft))
      );

    this.feeService.loadServiceFee();

    this.subtotalAmount$ = this.draft$.pipe(
      map(draft => draft.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))
    );

    this.discountAmount$ = combineLatest([
      this.subtotalAmount$, this.voucherService.appliedVoucher$
    ]).pipe(
      map(([subtotal, voucher]) => {
        if(!voucher) return 0;
        return this.voucherService.getDiscountAmount(subtotal);
      })
    )

    this.feeAmount$ = combineLatest([
      this.subtotalAmount$,
      this.discountAmount$,
      this.feeService.serviceFee$ // Observable, nicht synchroner Wert
    ]).pipe(
      map(([subtotal, discount, serviceFee]) => {
        return Math.round((subtotal - discount) * (serviceFee / 100));
      })
    );

    this.totalAmount$ = combineLatest([
      this.subtotalAmount$,
      this.discountAmount$,
      this.feeAmount$
    ]).pipe(
      map(([subtotal, discount, fee]) => subtotal - discount + fee)
    );
  }

  private draftSubject = new BehaviorSubject<OrderDraftDto>({
    restaurantId: '',
    items: []
  });
  draft$ = this.draftSubject.asObservable();
  restaurantId$ = this.draft$.pipe(
      map(draft => draft.restaurantId)
    );

  prepareOrder(cart: CartDto) {
    const items = this.getOrderItems(cart.items);
    
    const voucherCode = this.voucherService.getVoucherCode();

    const order: OrderDraftDto = {
      restaurantId: cart.restaurantId,
      items: items,
      voucherCode: voucherCode,
    };

    console.log('Preparing order:', order);

    this.draftSubject.next(order);
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

  clearDraft() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.draftSubject.next({restaurantId: '', items: []});
  }

  getDraft(): OrderDraftDto {
    return this.draftSubject.value;
  }

  setVoucherCode(voucherCode: string) {
    const currentDraft = this.draftSubject.value;

    this.draftSubject.next({
      ...currentDraft,
      voucherCode
    });
  }
}
