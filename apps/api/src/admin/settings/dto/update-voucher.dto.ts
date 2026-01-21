import { VoucherType } from '@generated/prisma/client';

export class UpdateVoucherDto {
  code?: string;
  type?: VoucherType;
  value?: number;
  active?: boolean;

  validFrom?: string;
  validTo?: string;

  usageLimit?: number;
}
