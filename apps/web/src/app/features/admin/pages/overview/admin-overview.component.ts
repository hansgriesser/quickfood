import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminStatsService, AdminStatsSummary } from '../../services/admin-stats.service';
import { AdminActivityService } from '../../services/admin-activity.service';
import { ActivityLog } from '../../model/activity-log.model';
import { firstValueFrom } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css'],
  providers: [AdminStatsService],
})
export class AdminOverviewComponent implements OnInit {
  private readonly activityService = inject(AdminActivityService);
  private readonly stats = inject(AdminStatsService);
  private readonly cdr = inject(ChangeDetectorRef);

  recentActivity: ActivityLog[] = [];
  loadingActivity = true;

  loadingStats = true;
  error: string | null = null;

  summary: AdminStatsSummary | null = null;

  async ngOnInit(): Promise<void> {
    this.error = null;
    this.summary = null;
    this.loadingStats = true;
    this.loadingActivity = true;

    try {
      // parallel starten
      const [summary] = await Promise.all([this.loadSummary(), this.loadRecentActivity()]);

      this.summary = summary;
      // console.log('SUMMARY', this.summary);
    } catch (e) {
      const err = e as HttpErrorResponse;
      // wenn Summary fehlschlägt
      this.error = err?.error?.message ?? err?.message ?? 'Failed to load statistics';
    } finally {
      this.loadingStats = false;
      this.cdr.detectChanges();
    }
  }

  private async loadSummary(): Promise<AdminStatsSummary> {
    return this.stats.getSummary();
  }

  private async loadRecentActivity(): Promise<void> {
    try {
      const obs$ = this.activityService.getRecent(10).pipe(
        take(1),
        finalize(() => {
          this.loadingActivity = false;
        }),
      );

      this.recentActivity = await firstValueFrom(obs$);
    } catch {
      // kein hard error fürs ganze Dashboard – nur Activity betrifft es
      this.recentActivity = [];
    }
  }

  activityLabel(a: ActivityLog): string {
    switch (a.type) {
      case 'AUTH_LOGIN_SUCCESS':
        return `User ${a.actor?.username} logged in`;
      case 'ADMIN_USER_WARN':
        return `Admin ${a.actor?.username} warned user ${a.meta?.targetUsername ?? '#' + a.targetId}`;
      case 'ADMIN_USER_SUSPEND':
        return `Admin ${a.actor?.username} suspended user ${a.meta?.targetUsername ?? '#' + a.targetId}`;
      case 'ADMIN_USER_UNSUSPEND':
        return `Admin ${a.actor?.username} unsuspended user ${a.meta?.targetUsername ?? '#' + a.targetId}`;
      case 'ADMIN_RESTAURANT_APPROVE':
        return `Restaurant approved (${a.meta?.name ?? a.targetId})`;
      case 'ADMIN_RESTAURANT_REJECT':
        return `Restaurant rejected (${a.meta?.name ?? a.targetId})`;
      case 'AUTH_REGISTER':
        return `New ${String(a.meta?.role).toLowerCase()} registered: ${a.meta?.username}`;
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
