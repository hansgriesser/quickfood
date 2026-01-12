export interface OwnerRestaurant {
  id: string;
  name: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  category?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreateOwnerRestaurantPayload {
  name: string;
  category?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateOwnerRestaurantPayload {
  name?: string;
  category?: string;
  contactEmail?: string;
  contactPhone?: string;
}
