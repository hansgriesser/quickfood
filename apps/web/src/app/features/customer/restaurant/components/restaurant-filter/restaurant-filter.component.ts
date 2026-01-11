import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface RestaurantFilter {
  searchTerm: string;
  category: string;
  minRating: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-restaurant-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './restaurant-filter.component.html',
  styleUrls: ['./restaurant-filter.component.css']
})
export class RestaurantFilterComponent {
  @Output() filterChanged = new EventEmitter<RestaurantFilter>();

  searchTerm = '';
  category = '';
  minRating = 0;
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  onSortByChange(): void {
    if (this.sortBy === 'rating') {
      this.sortOrder = 'desc';
    } else {
      this.sortOrder = 'asc';
    }
    this.onFilterChange();
  }
  //TODO: use category list from backend instead
  categories = [
    { value: '', label: 'Alle Kategorien' },
    { value: 'italian', label: 'Italienisch' },
    { value: 'asian', label: 'Asiatisch' },
    { value: 'mexican', label: 'Mexikanisch' },
    { value: 'fast-food', label: 'Fast Food' },
    { value: 'vegetarian', label: 'Vegetarisch' }
  ];

  ratings = [
    { value: 0, label: 'Alle Bewertungen' },
    { value: 3, label: '⭐ 3 und höher' },
    { value: 4, label: '⭐ 4 und höher' },
    { value: 4.5, label: '⭐ 4.5 und höher' }
  ];

  sortOptions = [
    { value: 'name', label: 'Nach Name' },
    { value: 'rating', label: 'Nach Bewertung' }
  ];

  onFilterChange(): void {
    this.filterChanged.emit({
      searchTerm: this.searchTerm,
      category: this.category,
      minRating: this.minRating,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.category = '';
    this.minRating = 0;
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.onFilterChange();
  }
}
