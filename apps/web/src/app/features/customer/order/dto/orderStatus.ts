export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DISPATCHED = 'DISPATCHED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'In Bearbeitung',
  [OrderStatus.ACCEPTED]: 'Bestellung angenommen',
  [OrderStatus.PREPARING]: 'In Zubereitung',
  [OrderStatus.READY]: 'Bereit zur Lieferung',
  [OrderStatus.DISPATCHED]: 'Unterwegs',
  [OrderStatus.REJECTED]: 'Abgelehnt',
  [OrderStatus.CANCELLED]: 'Storniert',
  [OrderStatus.DELIVERED]: 'Bestellung geliefert und abgeschlossen',
};
