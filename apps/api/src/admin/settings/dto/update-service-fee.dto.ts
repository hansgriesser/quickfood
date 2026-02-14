import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateServiceFeeDto {
  @IsNotEmpty()
  @IsNumber()
  percent!: number;
}
