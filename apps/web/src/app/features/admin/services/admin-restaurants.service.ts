import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RestaurantStatus, AdminRestaurant } from '../model/admin-restaurants.model';

@Injectable({ providedIn: 'root' })
export class AdminRestaurantsService {
  private readonly http = inject(HttpClient);

  list(status?: RestaurantStatus): Promise<AdminRestaurant[]> {
    const url = status
      ? `/api/admin/restaurants?status=${encodeURIComponent(status)}`
      : `/api/admin/restaurants`;
    return firstValueFrom(this.http.get<AdminRestaurant[]>(url));
  }

  approve(id: string): Promise<AdminRestaurant> {
    return firstValueFrom(
      this.http.patch<AdminRestaurant>(`/api/admin/restaurants/${id}/approve`, {}),
    );
  }

  reject(id: string): Promise<AdminRestaurant> {
    return firstValueFrom(
      this.http.patch<AdminRestaurant>(`/api/admin/restaurants/${id}/reject`, {}),
    );
  }
}
