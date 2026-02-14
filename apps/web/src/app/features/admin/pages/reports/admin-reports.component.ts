import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminReportsService,
  OrdersRevenueReport,
  ReportGroupBy,
} from '../../services/admin-reports.service';

type ReportKind = 'orders' | 'revenue';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css'],
})
export class AdminReportsComponent implements OnInit {
  kind: ReportKind = 'revenue';
  groupBy: ReportGroupBy = 'day';

  from = '';
  to = '';

  loading = false;
  error: string | null = null;
  report: OrdersRevenueReport | null = null;

  constructor(
    private readonly reports: AdminReportsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const to = new Date(now);
    const from = new Date(now);
    from.setDate(from.getDate() - 6);

    this.from = this.toDateInput(from);
    this.to = this.toDateInput(to);

    this.load();
  }

  async load() {
    this.loading = true;
    this.error = null;
    this.report = null;

    try {
      const params = {
        from: this.from || undefined,
        to: this.to || undefined,
        groupBy: this.groupBy,
      };

      this.report =
        this.kind === 'orders'
          ? await this.reports.getOrdersReport(params)
          : await this.reports.getRevenueReport(params);
    } catch (e: any) {
      this.error = e?.error?.message ?? 'Failed to load report';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  toDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  euro(cents: number): string {
    return (cents / 100).toFixed(2);
  }
}
