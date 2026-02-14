export type ReportGroupBy = 'day' | 'restaurant';

export interface DailyOrdersRevenuePoint {
  date: string;
  orders: number;
  revenueCents: number;
}

export interface RestaurantOrdersRevenuePoint {
  restaurantId: string;
  restaurantName: string;
  orders: number;
  revenueCents: number;
}
