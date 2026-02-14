import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceFeeService {
  private baseUrl = 'http://localhost:3000/api/order/service-fee';
  private serviceFee = 0;

  private serviceFeeSubject = new BehaviorSubject<number>(0);
  serviceFee$ = this.serviceFeeSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadServiceFee() {
    this.http.get<ServiceFeeResponse>(this.baseUrl).subscribe((res) => {
      this.serviceFeeSubject.next(res.percent);
    });
  }

  getFeeAmount(subtotal: number): number {
    return Math.round(subtotal * (this.serviceFee / 100));
  }
}

interface ServiceFeeResponse {
  percent: number;
}
