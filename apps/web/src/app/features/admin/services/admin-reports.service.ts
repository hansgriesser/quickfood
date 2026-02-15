import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReportGroupBy, OrdersRevenueReport } from '../model/admin-reports.model';

@Injectable({ providedIn: 'root' })
export class AdminReportsService {
  private readonly http = inject(HttpClient);

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
