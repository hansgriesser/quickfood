import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminStatsService, AdminStatsSummary } from '../../services/admin-stats.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css'],
  providers: [AdminStatsService],
})
export class AdminOverviewComponent implements OnInit {
  error: string | null = null;
  summary: AdminStatsSummary | null = null;

  constructor(
    private readonly stats: AdminStatsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

async ngOnInit(): Promise<void> {
  this.error = null;
  this.summary = null;

  try {
    this.summary = await this.stats.getSummary();
    console.log('SUMMARY', this.summary);
  } catch (e: any) {
    this.error = e?.error?.message ?? 'Failed to load statistics';
  } finally {
    this.cdr.detectChanges();
  }
}



  euro(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  get totalOrders(): number {
    return this.summary?.totals.totalOrders ?? 0;
  }

  get totalRevenueCents(): number {
    return this.summary?.totals.totalRevenueCents ?? 0;
  }

  get totalUsers(): number {
    return this.summary?.totals.totalUsers ?? 0;
  }

  get last7Orders(): number {
    return this.summary?.last7Days.orders ?? 0;
  }

  get last7RevenueCents(): number {
    return this.summary?.last7Days.revenueCents ?? 0;
  }

  get last7NewUsers(): number {
    return this.summary?.last7Days.newUsers ?? 0;
  }
}


