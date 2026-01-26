import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@generated/prisma/client';
import { mapOrderToDto, OrderDto } from 'src/order/order.dto';

export type OwnerOrderDto = OrderDto & {
  restaurant: {
    id: string;
    name: string;
  };
};

export function mapOwnerOrderToDto(
  order: PrismaOrder & {
    items: PrismaOrderItem[];
    restaurant: { id: string; name: string };
  },
): OwnerOrderDto {
  return {
    ...mapOrderToDto(order),
    restaurant: order.restaurant,
  };
}
