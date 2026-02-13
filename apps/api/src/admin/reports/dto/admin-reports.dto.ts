export type ReportGroupBy = 'day' | 'restaurant';

export type DailyOrdersRevenuePoint = {
  date: string;
  orders: number;
  revenueCents: number;
};

export type RestaurantOrdersRevenuePoint = {
  restaurantId: string;
  restaurantName: string;
  orders: number;
  revenueCents: number;
};
