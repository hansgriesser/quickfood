import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})export class ServiceFee {
    private baseUrl = 'http://localhost:3000/api/service-fee';

    constructor(private http: HttpClient) {}

    getServiceFee() {
        //add call, see sitemanager for reference
        return 0.1; //placeholder
    }
}