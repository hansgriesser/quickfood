export type ReportGroupBy = 'day' | 'restaurant';
export type ReportKind = 'orders' | 'revenue';

export interface DayPoint {
  date: string;
  orders: number;
  revenueCents: number;
}

export interface RestaurantPoint {
  restuarantId: string;
  restaurantName: string;
  orders: number;
  revenueCents: number;
}

export interface DayReport {
  range: { from: string; to: string };
  groupBy: 'day';
  totals: { orders: number; revenueCents: number };
  points: DayPoint[];
}

export interface RestaurantReport {
  range: { from: string; to: string };
  groupBy: 'restaurant';
  totals: { orders: number; revenueCents: number };
  points: RestaurantPoint[];
}

export type OrdersRevenueReport = DayReport | RestaurantReport;
