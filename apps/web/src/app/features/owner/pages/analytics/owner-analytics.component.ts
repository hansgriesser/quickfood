import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OwnerAnalyticsService,
  OwnerAnalyticsSummary,
} from '../../services/owner-analytics.service';
import { OwnerNavComponent } from '../../components/nav/owner-nav.component';

@Component({
  selector: 'app-owner-analytics',
  standalone: true,
  imports: [CommonModule, OwnerNavComponent],
  templateUrl: './owner-analytics.component.html',
  styleUrls: ['./owner-analytics.component.css'],
})
export class OwnerAnalyticsComponent implements OnInit {
  summary: OwnerAnalyticsSummary | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly analyticsService: OwnerAnalyticsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.summary = await this.analyticsService.getSummary();
    } catch (e: any) {
      this.errorMessage = e?.error?.message ?? e?.message ?? 'Could not load analytics.';
      this.summary = null;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  get todayOrders(): number {
    if (!this.summary) return 0;
    const todayKey = this.toDateKey(new Date());
    return this.summary.dailyOrders.find((p) => p.date === todayKey)?.orders ?? 0;
  }

  trackByDate(_: number, point: { date: string }): string {
    return point.date;
  }

  trackByDishId(_: number, dish: { dishId: number }): number {
    return dish.dishId;
  }

  private toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
