import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminStatsService, AdminStatsSummary } from '../../services/admin-stats.service';
import { AdminActivityService } from '../../services/admin-activity.service';
import { ActivityLog } from '../../model/activity-log.model';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css'],
  providers: [AdminStatsService],
})
export class AdminOverviewComponent implements OnInit {
  recentActivity: ActivityLog[] = [];
  loadingActivity = true;
  error: string | null = null;
  summary: AdminStatsSummary | null = null;

  constructor(
    private readonly activityService: AdminActivityService,
    private readonly stats: AdminStatsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

async ngOnInit(): Promise<void> {
  this.error = null;
  this.summary = null;
  this.loadRecentActivity();

  try {
    this.summary = await this.stats.getSummary();
    console.log('SUMMARY', this.summary);
  } catch (e: any) {
    this.error = e?.error?.message ?? 'Failed to load statistics';
  } finally {
    this.cdr.detectChanges();
  }
}

loadRecentActivity() {
  this.activityService.getRecent(10).subscribe({
    next: data => {
      this.recentActivity = data;
      this.loadingActivity = false;
    },
    error: () => {
      this.loadingActivity = false;
    },
  });
}

activityLabel(a: ActivityLog): string {
  switch (a.type) {
      case 'AUTH_LOGIN_SUCCESS':
        return `User ${a.actor?.username} logged in`;
      case 'ADMIN_USER_WARN':
        return `Admin ${a.actor?.username} warned user #${a.targetId}`;
      case 'ADMIN_USER_SUSPEND':
        return `Admin ${a.actor?.username} suspended user #${a.targetId}`;
      case 'ADMIN_USER_UNSUSPEND':
        return `Admin ${a.actor?.username} unsuspended user #${a.targetId}`;
      case 'ADMIN_RESTAURANT_APPROVE':
        return `Restaurant approved (${a.meta?.name ?? a.targetId})`;
      case 'ADMIN_RESTAURANT_REJECT':
        return `Restaurant rejected (${a.meta?.name ?? a.targetId})`;
      default:
        return a.type;
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


