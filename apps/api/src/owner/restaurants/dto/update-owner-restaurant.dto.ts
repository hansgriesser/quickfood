export class UpdateOwnerRestaurantDto {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  category?: string;
  openingHours?: OwnerOpeningHourInput[];
  deliveryZoneIds?: string[];
}

export interface OwnerOpeningHourInput {
  dayOfWeek: number;
  opensAt?: string;
  closesAt?: string;
  isClosed?: boolean;
}
