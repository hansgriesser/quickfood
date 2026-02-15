import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DeliveryZone, CreateZonePayload, UpdateZonePayload } from '../model/admin-zones.model';
@Injectable({
  providedIn: 'root',
})
export class AdminZonesService {
  private readonly http = inject(HttpClient);

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
