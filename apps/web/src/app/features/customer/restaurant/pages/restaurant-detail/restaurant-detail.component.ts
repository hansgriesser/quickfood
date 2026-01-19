import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RestaurantService } from '../../restaurant.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map, groupBy } from 'rxjs/operators';
import { Dish, MenuCategory, Restaurant } from '../../restaurant.model';
import { CartService } from '../../../cart/services/cart';
import { CartItemDto } from '../../../cart/cartDTO';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css'],
})
export class RestaurantDetailComponent {

  restaurant$: Observable<Restaurant | null>;
  categories$: Observable<MenuCategory[]> | undefined;
  cartItems$: Observable<CartItemDto[]>;
  id: string | undefined;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.restaurant$ = this.restaurantService.getRestaurantById(this.id);
    this.categories$ = this.restaurantService.getCategoriesForRestaurant(this.id);
  }


  constructor(private route: ActivatedRoute, private restaurantService: RestaurantService, private cartService: CartService) {
    this.restaurant$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
        switchMap(id => {
        if (!id) return of(null);                   
        return this.restaurantService.getRestaurantById(id) as Observable<Restaurant | null>;
      })                     
    );
    this.cartItems$ = this.cartService.cartItems$;
  }

  addToCart(dish: Dish){
    this.cartService.addDish(dish, this.id);
  }
}
