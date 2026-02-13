import { OrderItemDto } from "./orderDTO";

export interface OrderDraftDto {
  restaurantId: string;
  items: OrderItemDto[];
  voucherCode?: string;
  paymentMethodId?: PaymentMethod;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE',
}
