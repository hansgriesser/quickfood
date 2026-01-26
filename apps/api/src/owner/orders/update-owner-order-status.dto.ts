import { OrderStatus } from '@generated/prisma/client';

export class UpdateOwnerOrderStatusDto {
  status: OrderStatus;
}
