// src/app/interceptors/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ PUBLIC ENDPOINTS - No authentication required for GET requests
    const publicGetEndpoints = [
      '/Auth/login',
      '/Auth/register',
      '/Auth/verify-email',           // ✅ ADDED
      '/Auth/resend-verification',    // ✅ ADDED
      '/Products',
      '/Categories'
    ];
    
    // Check if this is a public GET endpoint
    const isPublicGetEndpoint = publicGetEndpoints.some(endpoint => 
      request.url.includes(endpoint)
    );
    
    // Only skip auth for GET requests to Products/Categories
    // POST/PUT/DELETE to these endpoints require authentication
    if (isPublicGetEndpoint) {
      if (request.method === 'GET' || 
          request.url.includes('/Auth/login') || 
          request.url.includes('/Auth/register') ||
          request.url.includes('/Auth/verify-email') ||
          request.url.includes('/Auth/resend-verification')) {
        console.log('🔓 JWT Interceptor: Skipping auth for public endpoint:', request.url);
        return next.handle(request);
      }
      // If it's POST/PUT/DELETE to Products/Categories, continue to add auth
      console.log('🔐 JWT Interceptor: Auth required for', request.method, 'request to:', request.url);
    }

    // Get token for protected endpoints
    const token = this.authService.getToken();
    
    console.log('=== JWT INTERCEPTOR DEBUG ===');
    console.log('Request:', request.method, request.url);
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
    console.log('IsLoggedIn:', this.authService.isLoggedIn);
    
    // Only add header if we have a valid token
    if (token && token !== 'undefined' && token !== 'null') {
      // Verify token format
      const parts = token.split('.');
      console.log('Token format valid (3 parts):', parts.length === 3);
      
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token expires:', new Date(payload.exp * 1000).toLocaleString());
          console.log('Is admin:', payload.role === 'Admin' || payload.role === 'admin');
        } catch (e) {
          console.error('Token decode error:', e);
        }
      }
      
      // Add token to request
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Authorization header added');
      console.log('=== END DEBUG ===');
      
      return next.handle(authRequest);
    } else {
      console.warn('⚠️ No valid token found for request:', request.url);
      console.log('=== END DEBUG ===');
      return next.handle(request);
    }
  }
}