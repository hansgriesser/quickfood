import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  ServiceFeeSetting,
  Voucher,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from '../model/admin-settings.model';

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private readonly http = inject(HttpClient);

  getServiceFee(): Promise<ServiceFeeSetting> {
    return firstValueFrom(this.http.get<ServiceFeeSetting>('/api/admin/settings/service-fee'));
  }

  updateServiceFee(percent: number): Promise<ServiceFeeSetting> {
    return firstValueFrom(
      this.http.put<ServiceFeeSetting>('/api/admin/settings/service-fee', { percent }),
    );
  }

  listVouchers(): Promise<Voucher[]> {
    return firstValueFrom(this.http.get<Voucher[]>('/api/admin/settings/vouchers'));
  }

  createVoucher(payload: CreateVoucherPayload): Promise<Voucher> {
    return firstValueFrom(this.http.post<Voucher>('/api/admin/settings/vouchers', payload));
  }

  updateVoucher(id: string, payload: UpdateVoucherPayload): Promise<Voucher> {
    return firstValueFrom(this.http.patch<Voucher>(`/api/admin/settings/vouchers/${id}`, payload));
  }
}
