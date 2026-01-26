/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
} from '@generated/prisma/client';

export class OrderDto {
  id: string;
  restaurantId: string;
  customerId: number;
  status: OrderStatus;
  subtotalAmount: number;
  discountAmount?: number;
  serviceAmount: number;
  totalAmount: number;
  voucherCode?: string;
  estimatedArrivalAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
}

export class OrderItemDto {
  id: number;
  orderId: string;
  dishId?: number;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DISPATCHED = 'DISPATCHED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export function mapOrderToDto(
  order: PrismaOrder & { items: PrismaOrderItem[] },
): OrderDto {
  return {
    id: order.id,
    restaurantId: order.restaurantId,
    customerId: order.customerId,
    status: mapOrderStatus(order.status),
    subtotalAmount: Number(order.subtotalAmount), // BigInt → number
    discountAmount: Number(order.discountAmount),
    serviceAmount: Number(order.serviceAmount),
    totalAmount: Number(order.totalAmount),
    voucherCode: order.voucherId ?? undefined,
    estimatedArrivalAt: order.estimatedArrivalAt?.toISOString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(mapOrderItemToDto),
  };
}

export function mapOrderItemToDto(item: any): OrderItemDto {
  return {
    id: item.id,
    orderId: item.orderId,
    dishId: item.dishId ?? undefined,
    name: item.name,
    unitPrice: Number(item.unitPrice), // BigInt → number
    quantity: item.quantity,
    totalPrice: Number(item.totalPrice),
    createdAt: item.createdAt.toISOString(),
  };
}

function mapOrderStatus(status: PrismaOrderStatus): OrderStatus {
  // einfache 1:1 Mapping Funktion
  switch (status) {
    case 'PENDING':
      return OrderStatus.PENDING;
    case 'ACCEPTED':
      return OrderStatus.ACCEPTED;
    case 'PREPARING':
      return OrderStatus.PREPARING;
    case 'READY':
      return OrderStatus.READY;
    case 'DISPATCHED':
      return OrderStatus.DISPATCHED;
    case 'REJECTED':
      return OrderStatus.REJECTED;
    case 'CANCELLED':
      return OrderStatus.CANCELLED;
  }
}
