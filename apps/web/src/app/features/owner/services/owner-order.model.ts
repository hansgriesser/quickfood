export interface OwnerOrderRestaurant {
  id: string;
  name: string;
}

export interface OwnerOrderItem {
  id?: number;
  orderId?: string;
  dishId?: number;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt?: string;
}

export interface OwnerOrder {
  id: string;
  restaurantId: string;
  restaurant?: OwnerOrderRestaurant;
  customerId: number;
  status: OrderStatus;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  voucherId?: string;
  estimatedArrivalAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OwnerOrderItem[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DISPATCHED = 'DISPATCHED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = "COMPLETED",
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.ACCEPTED]: 'Accepted',
  [OrderStatus.PREPARING]: 'Preparing',
  [OrderStatus.READY]: 'Ready',
  [OrderStatus.DISPATCHED]: 'Dispatched',
  [OrderStatus.REJECTED]: 'Rejected',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.COMPLETED]: 'Completed',
};
