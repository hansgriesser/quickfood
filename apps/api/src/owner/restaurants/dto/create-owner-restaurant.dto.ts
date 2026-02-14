import { IsOptional, IsString } from 'class-validator';

export class CreateOwnerRestaurantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
