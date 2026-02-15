import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserRole, AdminUser, UserModerationAction } from '../model/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);

  list(role?: UserRole, suspended?: boolean): Promise<AdminUser[]> {
    const params: string[] = [];
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (suspended !== undefined) params.push(`suspended=${suspended ? 'true' : 'false'}`);

    const url = params.length ? `/api/admin/users?${params.join('&')}` : `/api/admin/users`;

    return firstValueFrom(this.http.get<AdminUser[]>(url));
  }

  warn(id: number, reason?: string): Promise<UserModerationAction> {
    return firstValueFrom(
      this.http.post<UserModerationAction>(`/api/admin/users/${id}/warn`, { reason }),
    );
  }

  suspend(id: number, until?: string, reason?: string): Promise<UserModerationAction> {
    return firstValueFrom(
      this.http.post<UserModerationAction>(`/api/admin/users/${id}/suspend`, { until, reason }),
    );
  }

  unsuspend(id: number): Promise<UserModerationAction> {
    return firstValueFrom(
      this.http.post<UserModerationAction>(`/api/admin/users/${id}/unsuspend`, {}),
    );
  }
}
