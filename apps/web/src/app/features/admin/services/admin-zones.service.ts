import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface DeliveryZone {
  id: string;
  code: string;
  name: string;
  active: boolean;

  typicalDeliveryMin: number;
  typicalDeliveryMax: number;
}

export interface CreateZonePayload {
  code: string;
  name: string;
  active?: boolean;

  typicalDeliveryMin: number;
  typicalDeliveryMax: number;
}

export interface UpdateZonePayload {
  code?: string;
  name?: string;
  active?: boolean;

  typicalDeliveryMin?: number;
  typicalDeliveryMax?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminZonesService {
  constructor(private readonly http: HttpClient) {}

  list(active?: boolean): Promise<DeliveryZone[]> {
    const url =
      active === undefined
        ? '/api/admin/zones'
        : `/api/admin/zones?active=${active ? 'true' : 'false'}`;

    return firstValueFrom(this.http.get<DeliveryZone[]>(url));
  }

  create(payload: CreateZonePayload): Promise<DeliveryZone> {
    return firstValueFrom(this.http.post<DeliveryZone>('/api/admin/zones', payload));
  }

  update(id: string, payload: UpdateZonePayload): Promise<DeliveryZone> {
    return firstValueFrom(this.http.patch<DeliveryZone>(`/api/admin/zones/${id}`, payload));
  }
}
