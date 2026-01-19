export class CreateDeliveryZoneDto {
  code!: string;
  name!: string;
  active?: boolean;

  typicalDeliveryMin!: number;
  typicalDeliveryMax!: number;
}
