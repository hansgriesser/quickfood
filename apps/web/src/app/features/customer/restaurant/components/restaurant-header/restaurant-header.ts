import { Component, Input } from '@angular/core';
import { Restaurant } from '../../restaurant.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant-header',
  imports: [CommonModule],
  templateUrl: './restaurant-header.html',
  styleUrl: './restaurant-header.css',
  standalone: true,
})
export class RestaurantHeader {
   @Input() restaurant!: Restaurant;
}
