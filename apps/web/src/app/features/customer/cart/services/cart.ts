import { Injectable } from '@angular/core';
import { Dish } from '../../restaurant/restaurant.model';
import { BehaviorSubject, map, Observable} from 'rxjs';
import { CartDto, CartItemDto } from '../cartDTO';
import { OrderDraft } from '../../order/services/order-draft';
import { ServiceFeeService } from '../../order/services/service-fee';
import { combineLatest } from 'rxjs';

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
  serviceFee$!: Observable<number>;
  totalPrice$!: Observable<number>;

  constructor(
    private orderDraftService: OrderDraft,
    private feeService: ServiceFeeService
  ) {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartSubject.next(JSON.parse(saved) as CartDto);
    }

    this.cart$.subscribe(cart =>
      localStorage.setItem('cart', JSON.stringify(cart))
    );

    this.feeService.loadServiceFee();
    this.serviceFee$ = this.feeService.serviceFee$;

    this.totalPrice$ = combineLatest([
      this.cart$,
      this.serviceFee$
    ]).pipe(
      map(([cart, serviceFee]) => {
        const subtotal = cart.items.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        const feeAmount = Math.round(subtotal * (serviceFee / 100));
        return subtotal + feeAmount;
      })
    );
  }


  //Kommunikation mit Services
  
  prepareOrder() {
    return this.orderDraftService.prepareOrder(this.cartSubject.value);
  }

  //Cart Operationen

  clearCart() {
    localStorage.removeItem('cart');
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

    const existing = cart.items.find(i => i.dishId === item.dishId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.items.push(item);
    }

    cart.restaurantId = cart.restaurantId || restaurantId || '';
    this.updateCart(cart);
  }

  addItem(item: CartItemDto) {
    const cart = this.cartSubject.value;
    const existing = cart.items.find(i => i.dishId === item.dishId);

    if (existing) {
      existing.quantity++; // Mutieren ist okay, updateCart macht neues Array
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
    if (!cart.items || cart.items.length === 0) {
      this.clearCart();
      return;
    }

    this.cartSubject.next({
      ...cart,
      items: [...cart.items]
    });

    localStorage.setItem('cart', JSON.stringify(this.cartSubject.value));
  }
}
