export class UpdateDeliveryZoneDto {
  code?: string;
  name?: string;
  active?: boolean;

  typicalDeliveryMin?: number;
  typicalDeliveryMax?: number;
}
