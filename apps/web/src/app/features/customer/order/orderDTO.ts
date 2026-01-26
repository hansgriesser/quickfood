//alle Preise in Cent
export interface OrderDraftDto {
  restaurantId: string;
  items: OrderItemDto[];
  voucherCode?: string;
  paymentMethodId?: PaymentMethod;
}

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

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DISPATCHED = 'DISPATCHED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'In Bearbeitung',
  [OrderStatus.ACCEPTED]: 'Bestellung angenommen',
  [OrderStatus.PREPARING]: 'In Zubereitung',
  [OrderStatus.READY]: 'Bereit zur Lieferung',
  [OrderStatus.DISPATCHED]: 'Unterwegs',
  [OrderStatus.REJECTED]: 'Abgelehnt',
  [OrderStatus.CANCELLED]: 'Storniert',
};

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE',
}