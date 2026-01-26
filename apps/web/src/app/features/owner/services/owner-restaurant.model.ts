export interface OwnerRestaurant {
  id: string;
  name: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  category?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface OwnerDish {
  id: number;
  name: string;
  description?: string;
  price: number;
  pictureUrl?: string;
  categoryId?: number | null;
  restaurantId?: string;
}

export interface OwnerMenuCategory {
  id: number;
  name: string;
  sortOrder: number;
  restaurantId?: string;
  dishes: OwnerDish[];
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

export interface CreateMenuCategoryPayload {
  name: string;
  sortOrder?: number;
}

export interface UpdateMenuCategoryPayload {
  name?: string;
  sortOrder?: number;
}

export interface CreateDishPayload {
  name: string;
  description: string;
  price: number;
  categoryId?: number | null;
  pictureUrl?: string | null;
}

export interface UpdateDishPayload {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number | null;
  pictureUrl?: string | null;
}
