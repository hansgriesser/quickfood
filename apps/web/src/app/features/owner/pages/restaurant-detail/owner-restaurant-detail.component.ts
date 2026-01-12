import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OwnerRestaurantsService } from '../../services/owner-restaurants.service';
import { OwnerRestaurant } from '../../services/owner-restaurant.model';
import { OwnerRestaurantFormComponent } from '../../components/restaurant-form/owner-restaurant-form.component';

@Component({
  selector: 'app-owner-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, OwnerRestaurantFormComponent],
  templateUrl: './owner-restaurant-detail.component.html',
  styleUrls: ['./owner-restaurant-detail.component.css'],
})
export class OwnerRestaurantDetailComponent {
  restaurant?: OwnerRestaurant;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private ownerRestaurantsService: OwnerRestaurantsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Restaurant id missing.';
      return;
    }

    this.ownerRestaurantsService.getMyRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurant = restaurants.find((item) => item.id === id);
        if (!this.restaurant) {
          this.errorMessage = 'Restaurant not found.';
        }
      },
      error: () => {
        this.errorMessage = 'Could not load restaurant.';
      },
    });
  }

  saveRestaurant(payload: { name: string; category?: string; contactEmail?: string; contactPhone?: string }): void {
    if (!this.restaurant) return;

    this.ownerRestaurantsService.updateRestaurant(this.restaurant.id, payload).subscribe({
      next: (updated) => {
        this.restaurant = updated;
      },
      error: () => {
        this.errorMessage = 'Could not update restaurant.';
      },
    });
  }
}
