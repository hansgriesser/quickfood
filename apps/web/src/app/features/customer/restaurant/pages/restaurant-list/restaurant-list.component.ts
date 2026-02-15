import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  RestaurantFilterComponent,
  RestaurantFilter,
} from '../../components/restaurant-filter/restaurant-filter.component';
import { RestaurantService } from '../../restaurant.service';
import { Restaurant } from '../../restaurant.model';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [RouterModule, RestaurantFilterComponent],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css'],
})
export class RestaurantListComponent implements OnInit, OnDestroy {
  private restaurantService = inject(RestaurantService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  allRestaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];

  hasActiveOrder = false;

  private sub = new Subscription();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    const s = this.restaurantService.getRestaurants().subscribe((restaurants) => {
      this.allRestaurants = restaurants || [];
      this.filteredRestaurants = [...this.allRestaurants];
      this.cdr.detectChanges();
    });
    this.sub.add(s);
    this.checkActiveOrder();
  }

  onFilterChange(filter: RestaurantFilter): void {
    this.filteredRestaurants = this.allRestaurants.filter((restaurant) => {
      const matchesSearch = restaurant.name.toLowerCase().includes(filter.searchTerm.toLowerCase());

      const matchesCategory =
        !filter.category || restaurant.category?.toLowerCase() === filter.category.toLowerCase();
      const matchesRating = restaurant.rating >= filter.minRating;

      return matchesSearch && matchesCategory && matchesRating;
    });

    // Sortierung anwenden
    this.filteredRestaurants.sort((a, b) => {
      let compareValue = 0;

      if (filter.sortBy === 'name') {
        compareValue = a.name.localeCompare(b.name);
      } else if (filter.sortBy === 'rating') {
        compareValue = a.rating - b.rating;
      }

      return filter.sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private checkActiveOrder() {
    const activeOrderData = localStorage.getItem('active_order');
    if (activeOrderData) {
      this.hasActiveOrder = true;
    }
  }

  goToActiveOrder() {
    this.router.navigate(['/order/confirmation']);
  }
}
