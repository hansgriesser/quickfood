export interface OwnerRestaurant {
  id: string;
  name: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  category?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  openingHours?: OwnerOpeningHour[];
  deliveryZones?: OwnerRestaurantDeliveryZone[];
}

export interface OwnerOpeningHour {
  id?: number;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface DeliveryZone {
  id: string;
  code: string;
  name: string;
  active: boolean;
  typicalDeliveryMin: number;
  typicalDeliveryMax: number;
}

export interface OwnerRestaurantDeliveryZone {
  restaurantId?: string;
  zoneId: string;
  zone: DeliveryZone;
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
  logoUrl?: string | null;
  bannerUrl?: string | null;
}

export interface UpdateOwnerRestaurantPayload {
  name?: string;
  category?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  openingHours?: OwnerOpeningHourInput[];
  deliveryZoneIds?: string[];
}

export interface OwnerOpeningHourInput {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed?: boolean;
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
