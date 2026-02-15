import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDishDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  price: number;

  @IsOptional()
  @IsInt()
  categoryId?: number | null;

  @IsOptional()
  @IsString()
  pictureUrl?: string | null;
}
