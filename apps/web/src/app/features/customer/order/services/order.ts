import { Injectable } from '@angular/core';
import { OrderDto } from '../orderDTO';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {

  private baseUrl = 'http://localhost:3000/api/order'

  constructor(private http: HttpClient) {}

  placeOrder(order: OrderDto) {
    console.log('Sending order to server:', order);
    return this.http.post(`${this.baseUrl}`, order)
    .pipe(
      tap({
        next: (res) => console.log('Server response:', res),
        error: (err) => console.error('HTTP Error:', err)
      })
    );
  }
}
