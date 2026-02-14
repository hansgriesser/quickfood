import { VoucherType } from '@generated/prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateVoucherDto {
  @IsString()
  @IsOptional()
  code?: string;
  @IsOptional()
  @IsEnum(VoucherType)
  type?: VoucherType;
  @IsOptional()
  @IsNumber()
  value?: number;
  @IsOptional()
  @IsBoolean()
  active?: boolean;
  @IsOptional()
  @IsDateString()
  validFrom?: string;
  @IsOptional()
  @IsDateString()
  validTo?: string;
  @IsOptional()
  @IsNumber()
  usageLimit?: number;
}
