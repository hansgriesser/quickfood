import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface AdminRestaurant {
  id: string;
  name: string;
  status: RestaurantStatus;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  owner?: { id: number; username: string; role: string };
}

@Injectable({ providedIn: 'root' })
export class AdminRestaurantsService {
  constructor(private readonly http: HttpClient) {}

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
