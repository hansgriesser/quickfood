import { OrderStatus } from '@generated/prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOwnerOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
