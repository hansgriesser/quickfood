import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CreateOwnerRestaurantPayload,
  OwnerRestaurant,
} from '../../services/owner-restaurant.model';

@Component({
  selector: 'app-owner-restaurant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  };

  ngOnInit(): void {
    if (this.restaurant) {
      this.form = {
        name: this.restaurant.name,
        category: this.restaurant.category ?? '',
        contactEmail: this.restaurant.contactEmail ?? '',
        contactPhone: this.restaurant.contactPhone ?? '',
      };
    }
  }

  submit(): void {
    const payload: CreateOwnerRestaurantPayload = {
      name: this.form.name,
      category: this.form.category || undefined,
      contactEmail: this.form.contactEmail || undefined,
      contactPhone: this.form.contactPhone || undefined,
    };

    this.submitForm.emit(payload);
  }
}
