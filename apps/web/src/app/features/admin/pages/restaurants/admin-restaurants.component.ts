import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminRestaurantsService,
  AdminRestaurant,
  RestaurantStatus,
} from '../../services/admin-restaurants.service';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-restaurants.component.html',
  styleUrls: ['./admin-restaurants.component.css'],
})
export class AdminRestaurantsComponent implements OnInit {
  statuses: (RestaurantStatus | 'ALL')[] = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED'];
  selected: RestaurantStatus | 'ALL' = 'PENDING';

  loading = false;
  error: string | null = null;
  restaurants: AdminRestaurant[] = [];

  restaurantDecisionModalOpen = false;
  modalRestaurant: AdminRestaurant | null = null;
  restaurantDecision: 'APPROVE' | 'REJECT' = 'APPROVE';
  restaurantModalSubmitting = false;
  restaurantModalError: string | null = null;

  constructor(
    private readonly adminRestaurants: AdminRestaurantsService,
    private readonly cdr: ChangeDetectorRef,
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

  openRestaurantDecisionModal(r: AdminRestaurant, decision: 'APPROVE' | 'REJECT'): void {
    this.modalRestaurant = r;
    this.restaurantDecision = decision;
    this.restaurantModalError = null;
    this.restaurantModalSubmitting = false;
    this.restaurantDecisionModalOpen = true;
  }

  closeRestaurantDecisionModal(): void {
    this.restaurantDecisionModalOpen = false;
    this.modalRestaurant = null;
    this.restaurantModalSubmitting = false;
    this.restaurantModalError = null;
  }

  async confirmRestaurantDecision(): Promise<void> {
    if (!this.modalRestaurant) return;

    this.restaurantModalSubmitting = true;
    this.restaurantModalError = null;
    this.cdr.detectChanges();

    try {
      if (this.restaurantDecision === 'APPROVE') {
        await this.approve(this.modalRestaurant);
      } else {
        await this.reject(this.modalRestaurant);
      }
      this.closeRestaurantDecisionModal();
    } catch (e: any) {
      this.restaurantModalError = e?.error?.message || e?.message || 'Action failed';
    } finally {
      this.restaurantModalSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}
