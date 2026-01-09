import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { RestaurantFilterComponent, RestaurantFilter } from '../../components/restaurant-filter/restaurant-filter.component';
import { RestaurantService } from '../../restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RestaurantFilterComponent],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent {
  
  allRestaurants: any[] = [];
  filteredRestaurants: any[] = [];

  private sub = new Subscription();

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void{
    const s = this.restaurantService.getRestaurants().subscribe(restaurants => {
      this.allRestaurants = restaurants || [];
      this.filteredRestaurants = [...this.allRestaurants]
    });
    this.sub.add(s);
  }


  onFilterChange(filter: RestaurantFilter): void {
    this.filteredRestaurants = this.allRestaurants.filter(restaurant => {
      const matchesSearch = restaurant.name
        .toLowerCase()
        .includes(filter.searchTerm.toLowerCase());
      
      const matchesCategory = !filter.category || restaurant.category === filter.category;
      const matchesRating = restaurant.rating >= filter.minRating;

      return matchesSearch && matchesCategory && matchesRating;
    });

    // Sortierung anwenden
    this.filteredRestaurants.sort((a, b) => {
      let compareValue = 0;

      if (filter.sortBy === 'name') {
        compareValue = a.name.localeCompare(b.name);
      } else if (filter.sortBy === 'rating') {
        compareValue = a.rating - b.rating;
      }

      return filter.sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
