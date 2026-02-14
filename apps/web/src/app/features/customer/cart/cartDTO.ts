export interface CartItemDto {
  dishId: number;
  name: string;
  price: number; // cent
  quantity: number;
  pictureUrl?: string;
}

export interface CartDto {
  restaurantId: string;
  items: CartItemDto[];
  totalPrice: number;
}
