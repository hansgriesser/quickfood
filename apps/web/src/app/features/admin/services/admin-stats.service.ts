import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AdminStatsSummary {
  totals: {
    totalOrders: number;
    totalRevenueCents: number;
    totalUsers: number;
  };
  last7Days: {
    orders: number;
    revenueCents: number;
    newUsers: number;
  };
  trend: {
    date: string;
    orders: number;
    revenueCents: number;
    newUsers: number;
  }[];
}

@Injectable()
export class AdminStatsService {
  private readonly http = inject(HttpClient);

  getSummary(): Promise<AdminStatsSummary> {
    return firstValueFrom(this.http.get<AdminStatsSummary>('/api/admin/stats/summary'));
  }
}
