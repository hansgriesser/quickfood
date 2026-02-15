import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface OwnerAnalyticsSummary {
  range: {
    from: string;
    to: string;
  };
  weeklyOrders: number;
  dailyOrders: {
    date: string;
    orders: number;
  }[];
  topDishes: {
    dishId: number;
    name: string;
    restaurantId: string | null;
    restaurantName: string | null;
    orders: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OwnerAnalyticsService {
  constructor(private readonly http: HttpClient) {}

  getSummary(): Promise<OwnerAnalyticsSummary> {
    return firstValueFrom(
      this.http.get<OwnerAnalyticsSummary>('/api/owner/analytics/summary'),
    );
  }
}
