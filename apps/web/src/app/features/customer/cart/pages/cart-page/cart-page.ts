import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, Observable, combineLatest, startWith, switchMap, of } from 'rxjs';
import { CartService } from '../../services/cart';
import { Dish, Restaurant } from '../../../restaurant/restaurant.model';
import { CartItemDto } from '../../cartDTO';
import { Router } from '@angular/router';
import { RestaurantHeader } from '../../../restaurant/components/restaurant-header/restaurant-header';
import { RestaurantService } from '../../../restaurant/restaurant.service';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, RestaurantHeader],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
  standalone: true,
})
export class CartPage {
  cartService = inject(CartService);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);

  totalPrice$: Observable<number>;
  subtotal$: Observable<number>;
  cartItems$: Observable<CartItemDto[]>;
  serviceFee$: Observable<number>;
  cartSummary$: Observable<{
    subtotal: number;
    fee: number;
    total: number;
  }>;

  restaurant$: Observable<Restaurant | null>;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.totalPrice$ = this.cartService.totalPrice$;
    this.subtotal$ = this.cartService.cartItems$.pipe(
      map((items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0)),
      startWith(0),
    );
    this.serviceFee$ = this.cartService.serviceFee$;
    this.cartItems$ = this.cartService.cartItems$;
    this.serviceFee$ = combineLatest([this.subtotal$, this.serviceFee$]).pipe(
      map(([subtotal, serviceFeePercent]) => Math.round(subtotal * (serviceFeePercent / 100))),
    );
    this.cartSummary$ = combineLatest([this.subtotal$, this.serviceFee$, this.totalPrice$]).pipe(
      map(([subtotal, fee, total]) => ({ subtotal, fee, total })),
    );

    this.restaurant$ = this.cartService.restaurantId$.pipe(
      switchMap((id) => (id ? this.restaurantService.getRestaurantById(id) : of(null))),
    );
  }

  placeOrder() {
    console.log('Preparing order...');
    this.cartService.prepareOrder();
    this.router.navigate(['/order/review']);
  }

  increaseQuantity(dish: Dish) {
    this.cartService.addDish(dish, undefined);
  }

  increaseQuantityInCart(item: CartItemDto) {
    this.cartService.addItem(item);
  }

  decreaseQuantity(dishId: number) {
    this.cartService.removeOneItem(dishId);
  }

  removeItem(dishId: number) {
    this.cartService.removeItem(dishId);
  }
}
