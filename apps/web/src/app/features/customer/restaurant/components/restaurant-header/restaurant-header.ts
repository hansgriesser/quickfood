import { Component, Input } from '@angular/core';
import { Restaurant } from '../../restaurant.model';

@Component({
  selector: 'app-restaurant-header',
  imports: [],
  templateUrl: './restaurant-header.html',
  styleUrl: './restaurant-header.css',
  standalone: true,
})
export class RestaurantHeader {
  @Input() restaurant!: Restaurant;
}
