// ========== src/app/services/cart.service.ts ==========
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service'; // ADD THIS
import { Cart, CartItem, AddToCartRequest } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/Cart`;
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  public cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService // ADD THIS
  ) {
    // Charger le nombre d'articles au démarrage si connecté
    if (this.authService.isLoggedIn) {
      this.loadCartCount();
    }
  }

  // Récupérer le panier
  getCart(): Observable<Cart> {
    // ✅ ADD: Get current user to include userId if needed
    const user = this.authService.currentUserValue;
    if (!user) {
      return throwError(() => new Error('User not logged in'));
    }
    
    // Try with userId in URL if your backend requires it
    return this.http.get<Cart>(`${this.apiUrl}/user/${user.userId}`).pipe(
      catchError(error => {
        // If that endpoint doesn't work, try the generic one
        console.warn('Failed with user-specific endpoint, trying generic');
        return this.http.get<Cart>(this.apiUrl);
      })
    );
  }

  // Ajouter au panier
  addToCart(request: AddToCartRequest): Observable<any> {
    // ✅ ADD: Get current user
    const user = this.authService.currentUserValue;
    if (!user) {
      return throwError(() => new Error('User not logged in'));
    }
    
    // ✅ ADD: Include userId in request body if backend needs it
    const requestWithUser = {
      ...request,
      userId: user.userId // Add this line
    };
    
    return this.http.post(`${this.apiUrl}/items`, requestWithUser).pipe(
      tap((response) => {
        console.log('✅ Item added to cart:', response);
        this.loadCartCount();
      }),
      catchError(error => {
        console.error('❌ Error adding to cart:', error);
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour la quantité
  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${cartItemId}`, { quantity }).pipe(
      tap(() => {
        console.log('✅ Quantity updated');
        this.loadCartCount();
      })
    );
  }

  // Retirer du panier
  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${cartItemId}`).pipe(
      tap(() => {
        console.log('✅ Item removed from cart');
        this.loadCartCount();
      })
    );
  }

  // Vider le panier
  clearCart(): Observable<any> {
    // ✅ ADD: Get user for user-specific clear
    const user = this.authService.currentUserValue;
    if (!user) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.delete(`${this.apiUrl}/user/${user.userId}`).pipe(
      tap(() => {
        console.log('✅ Cart cleared');
        this.cartItemCountSubject.next(0);
      }),
      catchError(error => {
        // Try generic endpoint if user-specific fails
        console.warn('Failed with user-specific clear, trying generic');
        return this.http.delete(this.apiUrl).pipe(
          tap(() => this.cartItemCountSubject.next(0))
        );
      })
    );
  }

  // Récupérer le nombre d'articles
  getCartItemCount(): Observable<any> {
    const user = this.authService.currentUserValue;
    if (!user) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.get<any>(`${this.apiUrl}/user/${user.userId}/count`).pipe(
      catchError(error => {
        // Try generic endpoint
        return this.http.get<any>(`${this.apiUrl}/count`);
      })
    );
  }

  // Récupérer le total
  getCartTotal(): Observable<any> {
    const user = this.authService.currentUserValue;
    if (!user) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.get<any>(`${this.apiUrl}/user/${user.userId}/total`).pipe(
      catchError(error => {
        // Try generic endpoint
        return this.http.get<any>(`${this.apiUrl}/total`);
      })
    );
  }

  // Charger le nombre d'articles (pour le badge)
  private loadCartCount(): void {
    if (!this.authService.isLoggedIn) {
      this.cartItemCountSubject.next(0);
      return;
    }
    
    this.getCartItemCount().subscribe({
      next: (response) => {
        console.log('🛒 Cart count response:', response);
        // Handle different response formats
        if (response.count !== undefined) {
          this.cartItemCountSubject.next(response.count);
        } else if (typeof response === 'number') {
          this.cartItemCountSubject.next(response);
        } else {
          this.cartItemCountSubject.next(0);
        }
      },
      error: (error) => {
        console.error('Error loading cart count:', error);
        this.cartItemCountSubject.next(0);
      }
    });
  }

  // Getter pour le nombre actuel
  public get cartItemCountValue(): number {
    return this.cartItemCountSubject.value;
  }
}