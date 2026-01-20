import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityLog } from '../model/activity-log.model';

@Injectable({providedIn: 'root'})
export class AdminActivityService {
    private readonly baseUrl = '/api/admin/activity';

    constructor(private http: HttpClient) {}

    getRecent(limit = 10): Observable<ActivityLog[]> {
        return this.http.get<ActivityLog[]>(`${this.baseUrl}?limit=${limit}`);
}}