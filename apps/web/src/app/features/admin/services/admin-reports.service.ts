import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type ReportGroupBy = 'day' | 'restaurant';

export type DayPoint = {
    date: string;
    orders: number;
    revenueCents: number;
};

export type RestaurantPoint = {
    restuarantId: string;
    restaurantName: string;
    orders: number;
    revenueCents: number;
};

export type DayReport = {
    range: { from: string; to: string };
    groupBy: 'day';
    totals: { orders: number; revenueCents: number };
    points: DayPoint[];
}

export type RestaurantReport = {
  range: { from: string; to: string };
  groupBy: 'restaurant';
  totals: { orders: number; revenueCents: number };
  points: RestaurantPoint[];
};

export type OrdersRevenueReport = DayReport | RestaurantReport;

@Injectable({ providedIn: 'root' })
export class AdminReportsService {
  constructor(private readonly http: HttpClient) {}

  getRevenueReport(params: { from?: string; to?: string; groupBy?: ReportGroupBy }) {
  return firstValueFrom(this.getRevenueReport$(params));
}

  getOrdersReport(params: { from?: string; to?: string; groupBy?: ReportGroupBy }) {
    const qp = this.buildQuery(params);
    return firstValueFrom(this.http.get<OrdersRevenueReport>(`/api/admin/reports/orders${qp}`));
}

  getRevenueReport$(params: { from?: string; to?: string; groupBy?: ReportGroupBy }) {
  const qp = this.buildQuery(params);
  return this.http.get<OrdersRevenueReport>(`/api/admin/reports/revenue${qp}`);
}

  private buildQuery(params: { from?: string; to?: string; groupBy?: ReportGroupBy }) {
    const q: string[] = [];
    if (params.from) q.push(`from=${encodeURIComponent(params.from)}`);
    if (params.to) q.push(`to=${encodeURIComponent(params.to)}`);
    if (params.groupBy) q.push(`groupBy=${encodeURIComponent(params.groupBy)}`);
    return q.length ? `?${q.join('&')}` : '';
  }
}