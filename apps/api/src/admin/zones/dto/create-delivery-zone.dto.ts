import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDeliveryZoneDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsBoolean()
  active?: boolean;
  @IsNumber()
  @IsNotEmpty()
  typicalDeliveryMin!: number;
  @IsNumber()
  @IsNotEmpty()
  typicalDeliveryMax!: number;
}
