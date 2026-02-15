import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, mapOrderToDto, OrderDto } from './order.dto';
import { VoucherService } from 'src/voucher/voucher.service';
import { OrderStatus } from '@generated/prisma/enums';

export const SERVICE_FEE_KEY = 'SERVICE_FEE_PERCENT';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private voucherService: VoucherService,
  ) {}

  async placeOrder(order: CreateOrderDto, userId: number) {
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

    const discountAmount = await this.getDiscountAmount(
      Number(subtotalAmount),
      order.voucherCode,
    );

    const voucherId = await this.getVoucherId(order.voucherCode);

    const discountAmountBigInt = BigInt(discountAmount);

    const serviceFeeAmount = await this.getServiceFeeAmount(
      Number(subtotalAmount),
    );
    const totalAmount =
      subtotalAmount - discountAmountBigInt + BigInt(serviceFeeAmount);

    const created = await this.prisma.order.create({
      data: {
        restaurantId: order.restaurantId,
        customerId: userId,
        status: OrderStatus.PENDING,
        subtotalAmount: subtotalAmount,
        discountAmount: discountAmount,
        serviceAmount: serviceFeeAmount,
        totalAmount: totalAmount,
        voucherId: voucherId,
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

  async getDiscountAmount(subtotal: number, voucherCode: string | undefined) {
    if (!voucherCode) return 0;
    const voucher = await this.voucherService.validateVoucher(voucherCode);
    if (voucher?.active) {
      switch (voucher.type) {
        case 'FIXED':
          return Math.min(subtotal, voucher.amount);
        case 'PERCENT':
          return Math.floor((subtotal * voucher.amount) / 100);
        default:
          return 0;
      }
    } else {
      return 0;
    }
  }

  async getServiceFeeAmount(subtotal: number) {
    const serviceFee = await this.getServiceFee();
    return Math.round(subtotal * (serviceFee.percent / 100));
  }

  async getVoucherId(
    voucherCode: string | undefined,
  ): Promise<string | undefined> {
    if (!voucherCode) return undefined;

    const voucher = await this.prisma.voucher.findUnique({
      where: { code: voucherCode },
      select: { id: true },
    });

    return voucher?.id;
  }
}
