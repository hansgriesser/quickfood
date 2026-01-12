import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OwnerRestaurantsService } from '../../services/owner-restaurants.service';
import { OwnerRestaurant } from '../../services/owner-restaurant.model';
import { OwnerRestaurantFormComponent } from '../../components/restaurant-form/owner-restaurant-form.component';
import { catchError, finalize, of, take } from 'rxjs';

@Component({
  selector: 'app-owner-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterModule, OwnerRestaurantFormComponent],
  templateUrl: './owner-restaurant-list.component.html',
  styleUrls: ['./owner-restaurant-list.component.css'],
})
export class OwnerRestaurantListComponent implements OnInit {
  restaurants: OwnerRestaurant[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private ownerRestaurantsService: OwnerRestaurantsService,
    private cdr: ChangeDetectorRef,
  ) {}

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

  createRestaurant(payload: { name: string; category?: string; contactEmail?: string; contactPhone?: string }): void {
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
