import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { OwnerRestaurantsService } from '../../services/owner-restaurants.service';
import {
  CreateOwnerRestaurantPayload,
  OwnerRestaurant,
} from '../../services/owner-restaurant.model';
import { OwnerRestaurantFormComponent } from '../../components/restaurant-form/owner-restaurant-form.component';
import { OwnerNavComponent } from '../../components/nav/owner-nav.component';
import { catchError, finalize, of, take } from 'rxjs';

@Component({
  selector: 'app-owner-restaurant-list',
  standalone: true,
  imports: [RouterModule, OwnerRestaurantFormComponent, OwnerNavComponent],
  templateUrl: './owner-restaurant-list.component.html',
  styleUrls: ['./owner-restaurant-list.component.css'],
})
export class OwnerRestaurantListComponent implements OnInit {
  private ownerRestaurantsService = inject(OwnerRestaurantsService);
  private cdr = inject(ChangeDetectorRef);

  restaurants: OwnerRestaurant[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ownerRestaurantsService
      .getMyRestaurants()
      .pipe(
        take(1),
        catchError(() => {
          this.errorMessage = 'Could not load restaurants.';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe((restaurants) => {
        this.restaurants = Array.isArray(restaurants) ? restaurants : [];
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  createRestaurant(payload: CreateOwnerRestaurantPayload): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.ownerRestaurantsService
      .createRestaurant(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (restaurant) => {
          this.restaurants = [restaurant, ...this.restaurants];
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Could not create restaurant.';
        },
      });
  }

  trackByRestaurantId(_: number, restaurant: OwnerRestaurant): string {
    return restaurant.id;
  }
}
