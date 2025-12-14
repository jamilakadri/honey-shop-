import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review, CreateReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/Reviews`;

  constructor(private http: HttpClient) {}

  // Avis d'un produit
  getProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  // Créer un avis
  createReview(request: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, request);
  }

  // Mes avis
  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/me`);
  }

  // Supprimer un avis
  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Note moyenne d'un produit
  getProductAverageRating(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/product/${productId}/average`);
  }
}

// ========== src/app/services/wishlist.service.ts ==========
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/Wishlist`;

  constructor(private http: HttpClient) {}

  // Récupérer ma wishlist
  getWishlist(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Ajouter aux favoris
  addToWishlist(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}`, {});
  }

  // Retirer des favoris
  removeFromWishlist(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`);
  }

  // Vérifier si dans la wishlist
  isInWishlist(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check/${productId}`);
  }

  // Nombre d'articles
  getWishlistCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/count`);
  }
}