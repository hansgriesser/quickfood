import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus as PrismaOrderStatus } from '@generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { mapOwnerOrderToDto, OwnerOrderDto } from './owner-order.dto';

const STATUS_FLOW: Record<PrismaOrderStatus, PrismaOrderStatus | null> = {
  PENDING: null,
  ACCEPTED: PrismaOrderStatus.PREPARING,
  PREPARING: PrismaOrderStatus.READY,
  READY: PrismaOrderStatus.DISPATCHED,
  DISPATCHED: null,
  REJECTED: null,
  CANCELLED: null,
};

@Injectable()
export class OwnerOrdersService {
  constructor(private prisma: PrismaService) {}

  async list(
    ownerId: number,
    options?: { status?: string; restaurantId?: string },
  ): Promise<OwnerOrderDto[]> {
    const where: {
      restaurant: { ownerId: number };
      status?: PrismaOrderStatus;
      restaurantId?: string;
    } = {
      restaurant: { ownerId },
    };

    if (options?.restaurantId) {
      where.restaurantId = options.restaurantId;
    }

    if (options?.status) {
      where.status = this.parseStatus(options.status, 'status');
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        restaurant: { select: { id: true, name: true } },
      },
    });

    return orders.map(mapOwnerOrderToDto);
  }

  async accept(ownerId: number, orderId: string): Promise<OwnerOrderDto> {
    const existing = await this.getOwnerOrder(ownerId, orderId);

    if (existing.status !== PrismaOrderStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING orders can be accepted (current=${existing.status})`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: PrismaOrderStatus.ACCEPTED },
      include: {
        items: true,
        restaurant: { select: { id: true, name: true } },
      },
    });

    return mapOwnerOrderToDto(updated);
  }

  async reject(ownerId: number, orderId: string): Promise<OwnerOrderDto> {
    const existing = await this.getOwnerOrder(ownerId, orderId);

    if (existing.status !== PrismaOrderStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING orders can be rejected (current=${existing.status})`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: PrismaOrderStatus.REJECTED },
      include: {
        items: true,
        restaurant: { select: { id: true, name: true } },
      },
    });

    return mapOwnerOrderToDto(updated);
  }

  async updateStatus(
    ownerId: number,
    orderId: string,
    statusInput: string,
  ): Promise<OwnerOrderDto> {
    const status = this.parseStatus(statusInput, 'status');

    if (
      status !== PrismaOrderStatus.PREPARING &&
      status !== PrismaOrderStatus.READY &&
      status !== PrismaOrderStatus.DISPATCHED
    ) {
      throw new BadRequestException(
        'Status updates are limited to PREPARING, READY, or DISPATCHED.',
      );
    }

    const existing = await this.getOwnerOrder(ownerId, orderId);

    if (existing.status === status) {
      return mapOwnerOrderToDto(existing);
    }

    const nextStatus = STATUS_FLOW[existing.status];
    if (!nextStatus) {
      throw new BadRequestException(
        `Cannot update order in status ${existing.status}.`,
      );
    }

    if (nextStatus !== status) {
      throw new BadRequestException(
        `Invalid status transition ${existing.status} → ${status}.`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        restaurant: { select: { id: true, name: true } },
      },
    });

    return mapOwnerOrderToDto(updated);
  }

  private async getOwnerOrder(ownerId: number, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurant: { ownerId },
      },
      include: {
        items: true,
        restaurant: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private parseStatus(value: string, label: string): PrismaOrderStatus {
    if (!value) {
      throw new BadRequestException(`${label} is required`);
    }
    const normalized = value.trim().toUpperCase();
    const statuses = Object.values(PrismaOrderStatus);
    if (!statuses.includes(normalized as PrismaOrderStatus)) {
      throw new BadRequestException(`Invalid ${label} value`);
    }
    return normalized as PrismaOrderStatus;
  }
}
