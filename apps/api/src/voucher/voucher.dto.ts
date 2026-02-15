import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class VoucherDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
  type!: 'FIXED' | 'PERCENT';
  @IsNumber()
  @IsNotEmpty()
  amount!: number;
  @IsOptional()
  @IsDateString()
  validFrom?: string | null;
  @IsOptional()
  @IsDateString()
  validTo?: string | null;
  @IsBoolean()
  @IsNotEmpty()
  active!: boolean;
}
