import {
  OrderItem,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
} from '@generated/prisma/client';

import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsInt()
  @IsOptional()
  dishId?: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @IsNotEmpty()
  quantity!: number;

  @IsInt()
  @IsNotEmpty()
  unitPrice!: number;

  @IsInt()
  @IsNotEmpty()
  totalPrice!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty()
  items!: CreateOrderItemDto[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DISPATCHED = 'DISPATCHED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
export class OrderDto {
  @IsNotEmpty()
  @IsString()
  id!: string;
  @IsNotEmpty()
  @IsString()
  restaurantId!: string;
  @IsNotEmpty()
  @IsInt()
  customerId!: number;
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status!: OrderStatus;
  @IsNumber()
  @IsNotEmpty()
  subtotalAmount!: number;
  @IsNumber()
  @IsOptional()
  discountAmount?: number;
  @IsNumber()
  @IsNotEmpty()
  serviceAmount!: number;
  @IsNumber()
  @IsNotEmpty()
  totalAmount!: number;
  @IsString()
  @IsOptional()
  voucherCode?: string;
  @IsDateString()
  @IsOptional()
  estimatedArrivalAt?: string;
  @IsDateString()
  @IsNotEmpty()
  createdAt!: string;
  @IsDateString()
  @IsNotEmpty()
  updatedAt!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items!: OrderItemDto[];
}

export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  id!: number;
  @IsString()
  @IsNotEmpty()
  orderId!: string;
  @IsInt()
  @IsOptional()
  dishId?: number;
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsNumber()
  @IsNotEmpty()
  unitPrice!: number;
  @IsInt()
  @IsNotEmpty()
  quantity!: number;
  @IsNumber()
  @IsNotEmpty()
  totalPrice!: number;
  @IsDateString()
  @IsNotEmpty()
  createdAt!: string;
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

export function mapOrderItemToDto(item: OrderItem): OrderItemDto {
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
    case 'COMPLETED':
      return OrderStatus.COMPLETED;
  }
}
