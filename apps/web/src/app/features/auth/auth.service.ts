import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "./auth-model";
import { decodeJWT, getUserIdFromPayload } from "./jwt.util";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly tokenKey = 'qf_access_token';

    constructor(private http: HttpClient) {}

    get isLoggedIn(){
        return !!this.getToken();
    }

    async login(req: LoginRequest): Promise<LoginResponse> {
        const url = '/api/auth/login';
        
        const res = await firstValueFrom(this.http.post<LoginResponse>(url, req));
        localStorage.setItem(this.tokenKey, res.access_token);
        return res;
    }

    async register(req: RegisterRequest): Promise<RegisterResponse> {
        const url = '/api/auth/register';

        const res = await firstValueFrom(this.http.post<RegisterResponse>(url, req));
        localStorage.setItem(this.tokenKey, res.access_token);
        return res;
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('cart');
        localStorage.removeItem('orderDraft');
    }

    getUserRole(): 'USER' | 'OWNER' | 'ADMIN' | null {
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