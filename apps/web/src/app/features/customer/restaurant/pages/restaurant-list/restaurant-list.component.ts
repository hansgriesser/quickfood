import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent {
  restaurants = [
    { id: 1, name: 'Café Latte' },
    { id: 2, name: 'Espresso Bar' },
    { id: 3, name: 'Kaffee König' }
  ];
}
