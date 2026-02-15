import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityLog } from '../model/activity-log.model';

@Injectable({ providedIn: 'root' })
export class AdminActivityService {
  private http = inject(HttpClient);

  private readonly baseUrl = '/api/admin/activity';

  getRecent(limit = 10): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}?limit=${limit}`);
  }
}
