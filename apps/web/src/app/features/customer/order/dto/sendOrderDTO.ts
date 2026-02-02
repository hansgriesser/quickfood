export interface CreateOrderDto {
  restaurantId: string;
  voucherCode?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  dishId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
