import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnerOrder, OrderStatus } from './owner-order.model';

@Injectable({
  providedIn: 'root',
})
export class OwnerOrdersService {
  private readonly baseUrl = '/api/owner/orders';

  constructor(private http: HttpClient) {}

  listOrders(options?: { status?: OrderStatus; restaurantId?: string }): Observable<OwnerOrder[]> {
    let params = new HttpParams();

    if (options?.status) {
      params = params.set('status', options.status);
    }

    if (options?.restaurantId) {
      params = params.set('restaurantId', options.restaurantId);
    }

    return this.http.get<OwnerOrder[]>(this.baseUrl, { params });
  }

  acceptOrder(orderId: string): Observable<OwnerOrder> {
    return this.http.patch<OwnerOrder>(`${this.baseUrl}/${orderId}/accept`, {});
  }

  rejectOrder(orderId: string): Observable<OwnerOrder> {
    return this.http.patch<OwnerOrder>(`${this.baseUrl}/${orderId}/reject`, {});
  }

  updateStatus(orderId: string, status: OrderStatus): Observable<OwnerOrder> {
    return this.http.patch<OwnerOrder>(`${this.baseUrl}/${orderId}/status`, {
      status,
    });
  }
}
