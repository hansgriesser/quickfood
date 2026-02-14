import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryZoneDto {
  @IsString()
  @IsOptional()
  code?: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsOptional()
  @IsBoolean()
  active?: boolean;
  @IsOptional()
  @IsNumber()
  typicalDeliveryMin?: number;
  @IsOptional()
  @IsNumber()
  typicalDeliveryMax?: number;
}
