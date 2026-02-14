import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminReportsService } from '../../services/admin-reports.service';
import { ReportGroupBy, OrdersRevenueReport, ReportKind } from '../../model/admin-reports.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css'],
})
export class AdminReportsComponent implements OnInit {
  private readonly reports = inject(AdminReportsService);
  private readonly cdr = inject(ChangeDetectorRef);

  kind: ReportKind = 'revenue';
  groupBy: ReportGroupBy = 'day';

  from = '';
  to = '';

  loading = false;
  error: string | null = null;
  report: OrdersRevenueReport | null = null;

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
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err?.error?.message ?? 'Failed to load report';
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
