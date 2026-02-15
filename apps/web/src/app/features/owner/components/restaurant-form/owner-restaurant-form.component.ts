import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  CreateOwnerRestaurantPayload,
  OwnerRestaurant,
} from '../../services/owner-restaurant.model';

@Component({
  selector: 'app-owner-restaurant-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './owner-restaurant-form.component.html',
  styleUrls: ['./owner-restaurant-form.component.css'],
})
export class OwnerRestaurantFormComponent implements OnInit {
  @Input() restaurant?: OwnerRestaurant;
  @Input() submitLabel = 'Save';
  @Output() submitForm = new EventEmitter<CreateOwnerRestaurantPayload>();

  form: CreateOwnerRestaurantPayload = {
    name: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    bannerUrl: '',
  };

  ngOnInit(): void {
    if (this.restaurant) {
      this.form = {
        name: this.restaurant.name,
        category: this.restaurant.category ?? '',
        contactEmail: this.restaurant.contactEmail ?? '',
        contactPhone: this.restaurant.contactPhone ?? '',
        logoUrl: this.restaurant.logoUrl ?? '',
        bannerUrl: this.restaurant.bannerUrl ?? '',
      };
    }
  }

  submit(): void {
    const payload: CreateOwnerRestaurantPayload = {
      name: this.form.name,
      category: this.form.category || undefined,
      contactEmail: this.form.contactEmail || undefined,
      contactPhone: this.form.contactPhone || undefined,
      logoUrl: this.normalizeImageValue(this.form.logoUrl),
      bannerUrl: this.normalizeImageValue(this.form.bannerUrl),
    };

    this.submitForm.emit(payload);
  }

  onLogoSelected(event: Event): void {
    this.readImageFile(event, (url) => {
      this.form.logoUrl = url;
    });
  }

  onBannerSelected(event: Event): void {
    this.readImageFile(event, (url) => {
      this.form.bannerUrl = url;
    });
  }

  clearLogo(): void {
    this.form.logoUrl = '';
  }

  clearBanner(): void {
    this.form.bannerUrl = '';
  }

  private readImageFile(event: Event, onLoad: (url: string) => void): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type && !file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        onLoad(result);
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  private normalizeImageValue(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    const trimmed = value?.trim() ?? '';
    return trimmed ? trimmed : null;
  }
}
