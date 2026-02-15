export interface Restaurant {
  id: string;
  name: string;
  category?: string; // String vom Restaurant
  rating: number;
  contactEmail?: string;
  contactPhone?: string;
  address?: string; // falls du eine Adresse hast
  dishes: Dish[];
  menuCategories?: MenuCategory[];
  openingHours?: OpeningHour[];
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  price: number; // in Cent oder Einheit wie in DB
  pictureUrl?: string;
  category?: { id: number; name: string }; // MenuCategory vom Dish
}

export interface MenuCategory {
  id: number;
  name: string;
  sortOrder: number;
  dishes: Dish[];
}

export interface OpeningHour {
  day: string; // z.B. 'Montag'
  open: string; // '08:00'
  close: string; // '18:00'
}
