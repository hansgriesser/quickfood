import { VoucherType } from '@generated/prisma/client';

export class CreateVoucherDto {
  code!: string;
  type!: VoucherType;
  value!: number;
  active?: boolean;

  validFrom?: string;
  validTo?: string;

  usageLimit?: number;
}
