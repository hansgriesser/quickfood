import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, Role } from './auth-model';
import { decodeJWT, getUserIdFromPayload } from './jwt.util';

const LOCAL_STORAGE_CART_KEY = 'cart';
const LOCAL_STORAGE_ORDER_DRAFT_KEY = 'orderDraft';
const LOCAL_STORAGE_ACTIVE_ORDER_KEY = 'activeOrder';
const TOKEN_KEY = 'qf_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private baseUrl = '/api/auth';

  get isLoggedIn() {
    return !!this.getToken();
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    const url = `${this.baseUrl}/login`;

    const res = await firstValueFrom(this.http.post<LoginResponse>(url, req));
    localStorage.setItem(TOKEN_KEY, res.access_token);
    return res;
  }

  async register(req: RegisterRequest): Promise<RegisterResponse> {
    const url = `${this.baseUrl}/register`;

    const res = await firstValueFrom(this.http.post<RegisterResponse>(url, req));
    localStorage.setItem(TOKEN_KEY, res.access_token);
    return res;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ORDER_DRAFT_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_ORDER_KEY);
  }

  getUserRole(): Role | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = decodeJWT(token);
    return payload?.role || null;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = decodeJWT(token);
    return getUserIdFromPayload(payload);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = decodeJWT(token);
    return payload?.username || null;
  }
}
