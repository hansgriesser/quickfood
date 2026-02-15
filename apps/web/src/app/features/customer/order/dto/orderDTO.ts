import { OrderStatus } from './orderStatus';

//alle Preise in Cent
export interface OrderDto {
  id: string;
  restaurantId: string;
  customerId: number;
  status: OrderStatus;
  voucherCode: string | null;
  estimatedArrivalAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  subtotalAmount?: number;
  serviceAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
}

export interface OrderItemDto {
  id?: number;
  orderId?: string;
  dishId?: number;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt?: string;
}

export interface ActiveOrder {
  id: string;
  status: OrderStatus;
}
