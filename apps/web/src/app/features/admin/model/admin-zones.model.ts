export interface DeliveryZone {
  id: string;
  code: string;
  name: string;
  active: boolean;

  typicalDeliveryMin: number;
  typicalDeliveryMax: number;
}

export interface CreateZonePayload {
  code: string;
  name: string;
  active?: boolean;

  typicalDeliveryMin: number;
  typicalDeliveryMax: number;
}

export interface UpdateZonePayload {
  code?: string;
  name?: string;
  active?: boolean;

  typicalDeliveryMin?: number;
  typicalDeliveryMax?: number;
}
