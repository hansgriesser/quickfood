import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { mapOrderToDto, OrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async placeOrder(order: OrderDto, userId: number) {
    const created = await this.prisma.order.create({
      data: {
        restaurantId: order.restaurantId,
        customerId: userId,
        status: order.status,
        subtotalAmount: BigInt(order.subtotalAmount),
        discountAmount: BigInt(order.discountAmount),
        totalAmount: BigInt(order.totalAmount),
        items: {
          create: order.items.map((item) => ({
            dishId: item.dishId,
            name: item.name,
            unitPrice: BigInt(item.unitPrice),
            quantity: item.quantity,
            totalPrice: BigInt(item.totalPrice),
          })),
        },
      },
      include: { items: true },
    });

    return mapOrderToDto(created);
  }

  async updateOrder(id: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order mit id ${id} nicht gefunden`);
    }

    const orderDto: OrderDto = mapOrderToDto(order);
    return orderDto;
  }

  listOrders(id: string) {
    return this.prisma.order.findMany({
      where: { restaurantId: id },
      include: { items: true },
    });
  }
}
