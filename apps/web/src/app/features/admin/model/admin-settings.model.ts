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
