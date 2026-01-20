export class VoucherDto {
  code: string;
  type: 'FIXED' | 'PERCENT';
  amount: number;
  validFrom?: string | null;
  validTo?: string | null;
  active: boolean;
}
