import { VoucherType } from '@generated/prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsEnum(VoucherType)
  @IsNotEmpty()
  type!: VoucherType;
  @IsNumber()
  @IsNotEmpty()
  value!: number;
  @IsBoolean()
  @IsOptional()
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
