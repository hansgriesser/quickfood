import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map, Observable, combineLatest, startWith} from 'rxjs';
import { CartService } from '../../services/cart';
import { Dish } from '../../../restaurant/restaurant.model';
import { CartItemDto } from '../../cartDTO';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
  standalone: true
})
export class CartPage {
  
  totalPrice$: Observable<number>;
  subtotal$: Observable<number>;
  serviceFee: number; //in prozent
  cartItems$: Observable<CartItemDto[]>;
  serviceFee$: Observable<number>;
  cartSummary$: Observable<{
    subtotal: number;
    fee: number;
    total: number;
  }>

  constructor(public cartService: CartService){
    this.totalPrice$ = this.cartService.totalPrice$;
    this.subtotal$ = this.cartService.cartItems$.pipe(
      map(items => items.reduce((sum, i) => sum + i.price * i.quantity, 0)), startWith(0)
    );
    this.serviceFee = this.cartService.serviceFee;
    this.cartItems$ = this.cartService.cartItems$;
    this.serviceFee$ = this.subtotal$.pipe(
      map(subtotal => subtotal * this.serviceFee)
    )
    this.cartSummary$ = combineLatest([this.subtotal$, this.serviceFee$, this.totalPrice$]).pipe(
      map(([subtotal, fee, total]) => ({ subtotal, fee, total }))
    );

  }
  
  


  placeOrder(){
    console.log('Placing order...');
    this.cartService.placeOrder().subscribe({
      next: () => console.log('Order done'),
      error: err => console.error(err),
    });
  }

  increaseQuantity(dish: Dish) {
    this.cartService.addDish(dish, undefined);
  }

  increaseQuantityInCart(item: CartItemDto){
    this.cartService.addItem(item);
  }

  decreaseQuantity(dishId: number) {
    this.cartService.removeOneItem(dishId);
  }

  removeItem(dishId: number) {
    this.cartService.removeItem(dishId);
  }

}
