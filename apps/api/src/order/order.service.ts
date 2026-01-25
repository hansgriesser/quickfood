import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { mapOrderToDto, OrderDto } from './order.dto';

export const SERVICE_FEE_KEY = 'SERVICE_FEE_PERCENT';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async placeOrder(order: OrderDto, userId: number) {
    const itemsWithTotals = order.items.map((item) => {
      const totalPrice = BigInt(item.quantity) * BigInt(item.unitPrice ?? 0);
      return {
        ...item,
        totalPrice,
      };
    });

    const subtotalAmount = itemsWithTotals.reduce(
      (sum, item) => sum + item.totalPrice,
      BigInt(0),
    );

    const discountAmount = BigInt(0); // Platzhalter, Berechnung einfügen
    const totalAmount = subtotalAmount - discountAmount;

    const created = await this.prisma.order.create({
      data: {
        restaurantId: order.restaurantId,
        customerId: userId,
        status: order.status,
        subtotalAmount: subtotalAmount,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        items: {
          create: order.items.map((item) => ({
            dishId: item.dishId,
            name: item.name,
            unitPrice: BigInt(item.unitPrice),
            quantity: item.quantity,
            totalPrice: item.totalPrice,
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

  async listOrders(id: string) {
    return this.prisma.order.findMany({
      where: { restaurantId: id },
      include: { items: true },
    });
  }

  async getServiceFee() {
    const row = await this.prisma.platformSetting.findUnique({
      where: { key: SERVICE_FEE_KEY },
    });

    const percent = typeof row?.value === 'string' ? Number(row.value) : 0;

    return {
      percent: Number.isFinite(percent) ? percent : 0,
    };
  }
}
