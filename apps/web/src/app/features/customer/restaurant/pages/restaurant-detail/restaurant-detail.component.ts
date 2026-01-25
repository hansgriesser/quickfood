import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RestaurantService } from '../../restaurant.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map, groupBy, take } from 'rxjs/operators';
import { Dish, MenuCategory, Restaurant } from '../../restaurant.model';
import { CartService } from '../../../cart/services/cart';
import { CartItemDto } from '../../../cart/cartDTO';
import { RestaurantHeader } from '../../components/restaurant-header/restaurant-header';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, RestaurantHeader],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css'],
})
export class RestaurantDetailComponent {

  restaurant$!: Observable<Restaurant | null>;
  categories$: Observable<MenuCategory[]> | undefined;
  cartItems$: Observable<CartItemDto[]>;
  id: string | undefined;
  disableCartActions = false;
  totalItems$: Observable<Number>;
  


  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.restaurant$ = this.restaurantService.getRestaurantById(this.id);
    this.categories$ = this.restaurantService.getCategoriesForRestaurant(this.id);


    //falls Cart von anderem Restaurant belegt
    this.cartService.cart$.pipe(take(1)).subscribe(cart => {
      if (cart.items.length > 0 && cart.restaurantId !== this.id) {
        const confirmClear = confirm(
          'Du hast noch Items von einem anderen Restaurant im Warenkorb. Möchtest du den Warenkorb leeren?'
        );
        if (confirmClear) {
          this.cartService.clearCart();
        }else{
          this.disableCartActions = true;
        }
      }
    });
  }


  constructor(private route: ActivatedRoute, private restaurantService: RestaurantService, private cartService: CartService) {
    this.cartItems$ = this.cartService.cartItems$;
    this.totalItems$ = this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => sum + item.quantity, 0))
    );
  }

  addToCart(dish: Dish){
    this.cartService.addDish(dish, this.id);
  }
}
