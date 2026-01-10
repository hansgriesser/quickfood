import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRestaurantsService, AdminRestaurant, RestaurantStatus } from '../../services/admin-restaurants.service';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-restaurants.component.html',
  styleUrls: ['./admin-restaurants.component.css'],
})
export class AdminRestaurantsComponent {
  statuses: (RestaurantStatus | 'ALL')[] = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED'];
  selected: RestaurantStatus | 'ALL' = 'PENDING';

  loading = false;
  error: string | null = null;
  restaurants: AdminRestaurant[] = [];

  constructor(private readonly adminRestaurants: AdminRestaurantsService,
              private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  async onStatusChange(value: RestaurantStatus | 'ALL'): Promise<void> {
  this.selected = value;
  await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    try {
      const status = this.selected === 'ALL' ? undefined : this.selected;
      this.restaurants = await this.adminRestaurants.list(status);
    } catch (e: any) {
      this.error = e?.error?.message || e?.message || 'Failed to load restaurants';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async approve(r: AdminRestaurant): Promise<void> {
    try {
      await this.adminRestaurants.approve(r.id);
      await this.load();
    } catch (e: any) {
      this.error = e?.error?.message || e?.message || 'Approve failed';
    }
  }

  async reject(r: AdminRestaurant): Promise<void> {
    try {
      await this.adminRestaurants.reject(r.id);
      await this.load();
    } catch (e: any) {
      this.error = e?.error?.message || e?.message || 'Reject failed';
    }
  }
}
