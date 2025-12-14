// src/app/models/address.model.ts

export interface Address {
  addressId: number;
  userId: number;
  addressType: string; // 'Shipping' | 'Billing' | 'Both'
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressRequest {
  addressType: string; // 'Shipping' | 'Billing' | 'Both'
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  addressType?: string;
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  isDefault?: boolean;
}