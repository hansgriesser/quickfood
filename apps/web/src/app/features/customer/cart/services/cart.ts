import { Injectable } from '@angular/core';
import { Dish } from '../../restaurant/restaurant.model';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CartDto, CartItemDto } from '../cartDTO';
import { OrderDraftDto, OrderItemDto } from '../../order/orderDTO';
import { OrderDraft } from '../../order/services/order-draft';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private cart: CartDto = {
    restaurantId: '',
    items: [],
    totalPrice: 0
  };
  private cartItemsSubject = new BehaviorSubject<CartItemDto[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();
  serviceFee = 0.1; //replace with database call

  constructor(private orderDraftService: OrderDraft) {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartItemsSubject.next(JSON.parse(saved));
    }

    // automatisch speichern bei jeder Änderung
    this.cartItems$.subscribe(items => localStorage.setItem('cart', JSON.stringify(items)));
  }

  addDish(dish: Dish, restaurantId: string | undefined) {
    console.log("RestaurantID got from detail page:", restaurantId);
    const item: CartItemDto = {
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      pictureUrl: dish.pictureUrl
    };

    if (!this.cart.restaurantId) {
      this.cart.restaurantId = restaurantId!;
    }

    this.addItem(item);
  }

  addItem(item: CartItemDto) {
    const items = this.cartItemsSubject.value;
    const existing = items.find(i => i.dishId === item.dishId);

    if (existing) {
      existing.quantity++;
    } else {
      items.push(item);
    }

    // Subject push → UI updated automatisch
    this.updateCart(items);
  }

  removeItem(dishId: number) {
    const items = this.cartItemsSubject.value.filter(i => i.dishId !== dishId);
    this.updateCart(items);
  }

  removeOneItem(dishId: number){
    const items = this.cartItemsSubject.value;
    const item = this.getItemById(dishId);
    if(item === undefined) return;
    if(item.quantity > 1) {
      item.quantity--;
      this.updateCart(items);
    } else if(item.quantity === 1) {
      this.removeItem(dishId);
    }
  }
  
  prepareOrder() {
    return this.orderDraftService.prepareOrder(this.cart);
  }

  

  clearCart() {
    this.cartItemsSubject.next([]);
  }

  get totalPrice$(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => {
        const subtotal = items.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        const fee = Math.round(subtotal * 10 / 100); // 10 %
        const total = subtotal + fee;

        this.cart.totalPrice = total;
        return total;
      })
    );
  }


  getItemById(dishId: number) : CartItemDto | undefined{
    return this.cartItemsSubject.value.find(item => item.dishId === dishId);
  }

  private updateCart(items: CartItemDto[]) {
    this.cart.items = items;
    this.cartItemsSubject.next(items);
    this.totalPrice$;
  }

}
