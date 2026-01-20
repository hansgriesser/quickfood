export interface VoucherDto {
    code: string;
    active: boolean;
    type: 'PERCENT' | 'FIXED';
    amount: number; // in cents for FIXED, in percentage points for PERCENT
    validFrom?: string | null;
    validTo?: string | null;
}