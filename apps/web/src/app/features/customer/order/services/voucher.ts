import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VoucherDto } from '../voucherDTO';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Voucher {
  private baseUrl = 'http://localhost:3000/api/voucher';
  private appliedVoucherSubject = new BehaviorSubject<VoucherDto | null>(null);
  appliedVoucher$ = this.appliedVoucherSubject.asObservable();

  private voucherStateSubject = new BehaviorSubject<'idle' | 'checking' | 'valid' | 'invalid'>(
    'idle',
  );
  voucherState$ = this.voucherStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  checkVoucher(code: string) {
    this.voucherStateSubject.next('checking');

    this.http.get<VoucherDto>(`${this.baseUrl}/${code}`).subscribe({
      next: (voucher) => {
        // Kein Voucher zurück → direkt invalid
        if (!voucher) {
          this.appliedVoucherSubject.next(null); // Voucher zurücksetzen
          this.voucherStateSubject.next('invalid');
          return;
        }

        const now = new Date();
        const valid =
          voucher.active &&
          (!voucher.validFrom || new Date(voucher.validFrom) <= now) &&
          (!voucher.validTo || now <= new Date(voucher.validTo));

        if (valid) {
          this.appliedVoucherSubject.next(voucher); // Voucher speichern
          this.voucherStateSubject.next('valid');
        } else {
          this.appliedVoucherSubject.next(null); // Voucher zurücksetzen
          this.voucherStateSubject.next('invalid');
        }
      },
      error: () => {
        this.appliedVoucherSubject.next(null); // Fehler → Voucher löschen
        this.voucherStateSubject.next('invalid');
      },
    });
  }

  getDiscountAmount(subtotal: number): number {
    const voucher = this.appliedVoucherSubject.value;
    if (!voucher) return 0;
    console.log('discount amount calculated for voucher:', voucher);

    switch (voucher.type) {
      case 'FIXED':
        return Math.min(subtotal, voucher.amount);
      case 'PERCENT':
        return Math.floor((subtotal * voucher.amount) / 100);
      default:
        return 0;
    }
  }

  changeVoucherState() {
    if (this.voucherStateSubject.value === 'invalid') {
      this.voucherStateSubject.next('idle');
    }
  }

  getVoucherCode() {
    return this.appliedVoucherSubject.value?.code;
  }
}
