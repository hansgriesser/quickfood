import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Dish, MenuCategory, Restaurant } from './restaurant.model';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/restaurants';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getCategoriesForRestaurant(id: string): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.apiUrl}/${id}/dishes`);
  }
}
