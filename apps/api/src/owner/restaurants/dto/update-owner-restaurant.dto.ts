import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateOwnerRestaurantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  openingHours?: OwnerOpeningHourInput[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliveryZoneIds?: string[];
}

export interface OwnerOpeningHourInput {
  dayOfWeek: number;
  opensAt?: string;
  closesAt?: string;
  isClosed?: boolean;
}
