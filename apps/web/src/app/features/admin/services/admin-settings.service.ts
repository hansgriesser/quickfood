import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type VoucherType = 'PERCENT' | 'FIXED';

export interface ServiceFeeSetting {
    key: string;
    percent: number;
}

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  active: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  createdAt: string;
}

export interface CreateVoucherPayload {
  code: string;
  type: VoucherType;
  value: number;
  active?: boolean;
  validFrom?: string;
  validTo?: string;
  usageLimit?: number;
}

export interface UpdateVoucherPayload {
  code?: string;
  type?: VoucherType;
  value?: number;
  active?: boolean;
  validFrom?: string;
  validTo?: string;
  usageLimit?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
    constructor(private readonly http: HttpClient) {}

    getServiceFee(): Promise<ServiceFeeSetting> {
        return firstValueFrom(this.http.get<ServiceFeeSetting>('/api/admin/settings/service-fee'));
    }

    updateServiceFee(percent: number): Promise<any> {
        return firstValueFrom(this.http.put('/api/admin/settings/service-fee', { percent }));
    }

    listVouchers(): Promise<Voucher[]> {
        return firstValueFrom(this.http.get<Voucher[]>('/api/admin/settings/vouchers'));
    }

    createVoucher(payload: CreateVoucherPayload): Promise<Voucher> {
        return firstValueFrom(this.http.post<Voucher>('/api/admin/settings/vouchers', payload));
    }

    updateVoucher(id: string, payload: UpdateVoucherPayload): Promise<Voucher> {
        return firstValueFrom(this.http.patch<Voucher>(`/api/admin/settings/vouchers/${id}`, payload))
    }
}