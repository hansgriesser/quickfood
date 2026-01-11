import { Injectable } from '@angular/core';
import { Dish } from '../../restaurant/restaurant.model';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CartItemDto } from '../cartDTO';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private cartItemsSubject = new BehaviorSubject<CartItemDto[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();
  serviceFee = 0.1; //replace with database call

  constructor() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartItemsSubject.next(JSON.parse(saved));
    }

    // automatisch speichern bei jeder Änderung
    this.cartItems$.subscribe(items => localStorage.setItem('cart', JSON.stringify(items)));
  }

  addDish(dish: Dish){
    const item: CartItemDto = {
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      pictureUrl: dish.pictureUrl
    };

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
    this.cartItemsSubject.next([...items]);
  }

  removeItem(dishId: number) {
    const items = this.cartItemsSubject.value.filter(i => i.dishId !== dishId);
    this.cartItemsSubject.next(items);
  }

  removeOneItem(dishId: number){
    const items = this.cartItemsSubject.value;
    const item = this.getItemById(dishId);
    if(item === undefined) return;
    if(item.quantity > 1) {
      item.quantity--;
      this.cartItemsSubject.next([...items]);
    } else if(item.quantity === 1) {
      this.removeItem(dishId);
    }
  }

  clearCart() {
    this.cartItemsSubject.next([]);
  }

  get totalPrice$(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => {
        const sum = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const total = sum + sum * this.serviceFee;
        return total;
      })
    );
  }

  getItemById(dishId: number) : CartItemDto | undefined{
    return this.cartItemsSubject.value.find(item => item.dishId === dishId);
  }

  

}
