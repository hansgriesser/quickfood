export type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface AdminRestaurant {
  id: string;
  name: string;
  status: RestaurantStatus;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  owner?: { id: number; username: string; role: string };
}
