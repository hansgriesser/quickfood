import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateOwnerRestaurantPayload,
  OwnerRestaurant,
  UpdateOwnerRestaurantPayload,
} from './owner-restaurant.model';

@Injectable({
  providedIn: 'root',
})
export class OwnerRestaurantsService {
  private readonly baseUrl = '/api/owner/restaurants';

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
}
