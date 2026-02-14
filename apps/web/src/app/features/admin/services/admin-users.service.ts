import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export interface AdminUser {
  id: number;
  username: string;
  role: UserRole;
  isSuspended: boolean;
  suspendedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  constructor(private readonly http: HttpClient) {}

  list(role?: UserRole, suspended?: boolean): Promise<AdminUser[]> {
    const params: string[] = [];
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (suspended !== undefined) params.push(`suspended=${suspended ? 'true' : 'false'}`);

    const url = params.length ? `/api/admin/users?${params.join('&')}` : `/api/admin/users`;

    return firstValueFrom(this.http.get<AdminUser[]>(url));
  }

  warn(id: number, reason?: string): Promise<any> {
    return firstValueFrom(this.http.post(`/api/admin/users/${id}/warn`, { reason }));
  }

  suspend(id: number, until?: string, reason?: string): Promise<any> {
    return firstValueFrom(this.http.post(`/api/admin/users/${id}/suspend`, { until, reason }));
  }

  unsuspend(id: number): Promise<any> {
    return firstValueFrom(this.http.post(`/api/admin/users/${id}/unsuspend`, {}));
  }
}
