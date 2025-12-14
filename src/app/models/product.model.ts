// src/app/models/product.model.ts - KEEP AS CAMELCASE
import { Category } from "./category.model";

export interface Product {
  // KEEP camelCase - backend will accept it
  productId: number;
  categoryId?: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  sku?: string;  // KEEP lowercase
  weight?: number;
  origin?: string;
  harvestDate?: string;
  expiryDate?: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  saleCount: number;
  createdAt: string;
  updatedAt?: string;
  category?: Category;
  productImages?: ProductImage[];
}

export interface ProductImage {
  imageId: number;
  productId: number;
  imageUrl: string;  // camelCase
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

// DTO for creating products - KEEP camelCase
export interface CreateProductDto {
  categoryId?: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  sku?: string;  // KEEP lowercase
  weight?: number;
  origin?: string;
  harvestDate?: string;
  expiryDate?: string;
  isActive: boolean;
  isFeatured: boolean;
}