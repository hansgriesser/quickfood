import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RestaurantService } from '../../restaurant.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map, groupBy } from 'rxjs/operators';
import { Dish, MenuCategory, Restaurant } from '../../restaurant.model';

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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.restaurant$ = this.restaurantService.getRestaurantById(id);
    this.categories$ = this.restaurantService.getCategoriesForRestaurant(id);
  }


  constructor(private route: ActivatedRoute, private restaurantService: RestaurantService) {
    this.restaurant$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
        switchMap(id => {
        if (!id) return of(null);                   
        return this.restaurantService.getRestaurantById(id) as Observable<Restaurant | null>;
      })                     
    );
  }
}
