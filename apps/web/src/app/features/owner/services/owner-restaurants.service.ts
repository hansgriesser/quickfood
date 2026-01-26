import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateOwnerRestaurantPayload,
  CreateDishPayload,
  CreateMenuCategoryPayload,
  OwnerDish,
  OwnerMenuCategory,
  OwnerRestaurant,
  UpdateDishPayload,
  UpdateMenuCategoryPayload,
  UpdateOwnerRestaurantPayload,
} from './owner-restaurant.model';

@Injectable({
  providedIn: 'root',
})
export class OwnerRestaurantsService {
  private readonly baseUrl = '/api/owner/restaurants';
  private readonly publicRestaurantsUrl = '/api/restaurants';

  constructor(private http: HttpClient) {}

  getMyRestaurants(): Observable<OwnerRestaurant[]> {
    return this.http.get<OwnerRestaurant[]>(this.baseUrl);
  }

  createRestaurant(payload: CreateOwnerRestaurantPayload): Observable<OwnerRestaurant> {
    return this.http.post<OwnerRestaurant>(this.baseUrl, payload);
  }

  updateRestaurant(
    id: string,
    payload: UpdateOwnerRestaurantPayload,
  ): Observable<OwnerRestaurant> {
    return this.http.patch<OwnerRestaurant>(`${this.baseUrl}/${id}`, payload);
  }

  getMenu(restaurantId: string): Observable<OwnerMenuCategory[]> {
    return this.http.get<OwnerMenuCategory[]>(
      `${this.publicRestaurantsUrl}/${restaurantId}/dishes`,
    );
  }

  createCategory(
    restaurantId: string,
    payload: CreateMenuCategoryPayload,
  ): Observable<OwnerMenuCategory> {
    return this.http.post<OwnerMenuCategory>(
      `${this.baseUrl}/${restaurantId}/categories`,
      payload,
    );
  }

  updateCategory(
    restaurantId: string,
    categoryId: number,
    payload: UpdateMenuCategoryPayload,
  ): Observable<OwnerMenuCategory> {
    return this.http.patch<OwnerMenuCategory>(
      `${this.baseUrl}/${restaurantId}/categories/${categoryId}`,
      payload,
    );
  }

  deleteCategory(restaurantId: string, categoryId: number): Observable<OwnerMenuCategory> {
    return this.http.delete<OwnerMenuCategory>(
      `${this.baseUrl}/${restaurantId}/categories/${categoryId}`,
    );
  }

  createDish(
    restaurantId: string,
    payload: CreateDishPayload,
  ): Observable<OwnerDish> {
    return this.http.post<OwnerDish>(
      `${this.baseUrl}/${restaurantId}/dishes`,
      payload,
    );
  }

  updateDish(
    restaurantId: string,
    dishId: number,
    payload: UpdateDishPayload,
  ): Observable<OwnerDish> {
    return this.http.patch<OwnerDish>(
      `${this.baseUrl}/${restaurantId}/dishes/${dishId}`,
      payload,
    );
  }

  deleteDish(restaurantId: string, dishId: number): Observable<OwnerDish> {
    return this.http.delete<OwnerDish>(
      `${this.baseUrl}/${restaurantId}/dishes/${dishId}`,
    );
  }
}
