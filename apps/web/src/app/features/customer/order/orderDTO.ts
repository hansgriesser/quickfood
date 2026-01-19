//alle Preise in Cent

export interface OrderDto {
  id: string;
  restaurantId: string;
  customerId: number;
  status: OrderStatus;
  subtotalAmount: number; 
  discountAmount: number; 
  totalAmount: number;    
  voucherId?: string;
  estimatedArrivalAt?: string; 
  createdAt: string;           
  updatedAt: string;          
  items: OrderItemDto[];
}

export interface OrderItemDto {
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

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'In Bearbeitung',
  [OrderStatus.ACCEPTED]: 'Bestellung angenommen',
  [OrderStatus.PREPARING]: 'In Zubereitung',
  [OrderStatus.READY]: 'Bereit zur Lieferung',
  [OrderStatus.DISPATCHED]: 'Unterwegs',
  [OrderStatus.REJECTED]: 'Abgelehnt',
  [OrderStatus.CANCELLED]: 'Storniert',
};