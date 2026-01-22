import { Injectable } from '@angular/core';
import { Dish } from '../../restaurant/restaurant.model';
import { BehaviorSubject, map} from 'rxjs';
import { CartDto, CartItemDto } from '../cartDTO';
import { OrderDraft } from '../../order/services/order-draft';
import { ServiceFee } from '../../order/services/service-fee';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private cartSubject = new BehaviorSubject<CartDto>({
    restaurantId: '',
    items: [],
    totalPrice: 0
  });

  cart$ = this.cartSubject.asObservable();
  cartItems$ = this.cart$.pipe(
    map(cart => cart.items)
  );
  restaurantId$ = this.cart$.pipe(
    map(cart => cart.restaurantId)
  );
  totalPrice$ = this.cart$.pipe(
    map(cart => {
      const subtotal = cart.items.reduce(
        (acc, i) => acc + i.price * i.quantity,
        0
      );

      const fee = Math.round(subtotal * this.serviceFee);
      return subtotal + fee;
    })
  );

  serviceFee = 0.1; 

  constructor(private orderDraftService: OrderDraft, private feeService: ServiceFee) {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartSubject.next(JSON.parse(saved) as CartDto);
    }
    // automatisch speichern bei jeder Änderung
    this.cart$.subscribe(cart => localStorage.setItem('cart', JSON.stringify(cart)));
    this.serviceFee = this.feeService.getServiceFee();
  }

  //Kommunikation mit Services
  
  prepareOrder() {
    return this.orderDraftService.prepareOrder(this.cartSubject.value);
  }

  //Cart Operationen

  clearCart() {
    this.cartSubject.next({
      restaurantId: '',
      items: [],
      totalPrice: 0
    });
  }
  
  addDish(dish: Dish, restaurantId?: string) {
    const cart = this.cartSubject.value;

    const item: CartItemDto = {
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      pictureUrl: dish.pictureUrl
    };

    const updatedCart: CartDto = {
      ...cart,
      restaurantId: cart.restaurantId || restaurantId || '',
      items: this.addOrUpdateItem(cart.items, item),
    };

    this.updateCart(updatedCart);
  }

  addItem(item: CartItemDto) {
    const cart = this.cartSubject.value;
    const existing = cart.items.find(i => i.dishId === item.dishId);

    if (existing) {
      existing.quantity++;
    } else {
      cart.items.push(item);
    }

    this.updateCart(cart);
  }

  removeItem(dishId: number) {
    const cart = this.cartSubject.value;

    this.updateCart({
      ...cart,
      items: cart.items.filter(i => i.dishId !== dishId)
    });
  }

  removeOneItem(dishId: number) {
    const cart = this.cartSubject.value;

    const updatedItems = cart.items
      .map(i =>
        i.dishId === dishId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      )
      .filter(i => i.quantity > 0);

    this.updateCart({
      ...cart,
      items: updatedItems
    });
  }

  //Hiilfsfunktionen

  private updateCart(cart: CartDto) {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalPrice = subtotal + Math.round(subtotal * this.serviceFee);

    this.cartSubject.next({
      ...cart,
      totalPrice
    });
  }


  private addOrUpdateItem(
    items: CartItemDto[],
    item: CartItemDto
  ): CartItemDto[] {
    const safeItems = items || [];
    const existing = safeItems.find(i => i.dishId === item.dishId);

    if (!existing) {
      return [... safeItems, item];
    }

    return safeItems.map(i =>
      i.dishId === item.dishId
        ? { ...i, quantity: i.quantity + 1 }
        : i
    );
  }

}
