// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/Admin`;

  constructor(private http: HttpClient) {}

  // Get dashboard statistics
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  // Get recent orders
  getRecentOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/recent`);
  }

  // Get top products
  getTopProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/top`);
  }
}