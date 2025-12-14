// src/app/services/product.service.ts - SIMPLE VERSION
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductImage, CreateProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/Products`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les produits
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  

  // Récupérer les produits actifs
  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/active`);
  }

  // Récupérer les produits en vedette
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  // Récupérer un produit par ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Récupérer un produit par slug
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }

  // Récupérer les produits par catégorie
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  // Rechercher des produits
  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search`, {
      params: { term: searchTerm }
    });
  }

  // Créer un produit (Admin)
  createProduct(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Mettre à jour un produit (Admin)
  updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }

  // Supprimer un produit (Admin)
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get Product Images
  getProductImages(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiUrl}/${productId}/images`);
  }

  // Add Product Image
  addProductImage(productId: number, image: Partial<ProductImage>): Observable<ProductImage> {
    return this.http.post<ProductImage>(`${this.apiUrl}/${productId}/images`, image);
  }

  // Update Product Image
  updateProductImage(productId: number, imageId: number, image: Partial<ProductImage>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}/images/${imageId}`, image);
  }

  // Delete Product Image
  deleteProductImage(productId: number, imageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}/images/${imageId}`);
  }
  // Upload Product Image with File
  uploadProductImage(productId: number, file: File, imageData: Partial<ProductImage>): Observable<ProductImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', imageData.altText || '');
    formData.append('displayOrder', imageData.displayOrder?.toString() || '0');
    formData.append('isPrimary', imageData.isPrimary ? 'true' : 'false');
    
    return this.http.post<ProductImage>(`${this.apiUrl}/${productId}/images/upload`, formData);
  }
}