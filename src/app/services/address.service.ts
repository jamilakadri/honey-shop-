// src/app/services/address.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/Addresses`;

  constructor(private http: HttpClient) {}

  // Get all addresses for current user
  getMyAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  // Get address by ID
  getAddressById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/${id}`);
  }

  // Create new address
  createAddress(request: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, request);
  }

  // Update address
  updateAddress(id: number, request: UpdateAddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, request);
  }

  // Delete address
  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Set default address
  setDefaultAddress(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/set-default`, {});
  }

  // Get default shipping address
  getDefaultShippingAddress(): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/default/shipping`);
  }

  // Get default billing address
  getDefaultBillingAddress(): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/default/billing`);
  }
}