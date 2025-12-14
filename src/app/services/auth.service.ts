import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    console.log('🔧 AuthService Constructor');
    console.log('Stored User:', storedUser);
    console.log('Token exists:', !!token);
    
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    if (this.currentUserSubject.value) {
      console.log('✅ User restored from localStorage:', this.currentUserSubject.value);
      console.log('Is Admin:', this.currentUserSubject.value.role);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.currentUserSubject.value;
    const loggedIn = !!token && !!user;
    
    console.log('🔍 isLoggedIn check:', {
      hasToken: !!token,
      hasUser: !!user,
      result: loggedIn
    });
    
    return loggedIn;
  }

  public get isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    const isAdminUser = user?.role === 'Admin' || user?.role === 'admin';
    
    console.log('🔍 isAdmin check:', {
      user: user,
      role: user?.role,
      result: isAdminUser
    });
    
    return isAdminUser;
  }

  updatePhone(phoneNumber: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-phone`, { phoneNumber }).pipe(
      tap((response) => {
        console.log('Phone update response:', response);
        
        const currentUser = this.currentUserValue;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            phoneNumber: phoneNumber
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      }),
      catchError(error => {
        console.error('Phone update error:', error);
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        console.log('📝 Register Response:', response);
        
        // ✅ NE PAS sauvegarder la session automatiquement
        // L'utilisateur doit d'abord vérifier son email
        console.log('✅ Registration successful, awaiting email verification');
        
        // NE PAS APPELER setSession() ici !
      }),
      catchError(error => {
        console.error('❌ Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(request: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        console.log('🔐 Login Response:', response);
        
        let authData = response.data || response;
        
        const normalizedData = {
          token: authData.Token || authData.token,
          userId: authData.UserId || authData.userId,
          email: authData.Email || authData.email,
          firstName: authData.FirstName || authData.firstName,
          lastName: authData.LastName || authData.lastName,
          role: authData.Role || authData.role
        };
        
        console.log('🔄 Normalized data:', normalizedData);
        this.setSession(normalizedData);
        
        console.log('After login - Token:', !!this.getToken());
        console.log('After login - User:', this.currentUserValue);
        console.log('After login - isAdmin:', this.isAdmin);
      }),
      catchError(error => {
        console.error('❌ Login Error:', error);
        throw error;
      })
    );
  }

  // ✅ NOUVELLE MÉTHODE: Vérifier l'email
  verifyEmail(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-email`, { token }).pipe(
      tap(response => {
        console.log('✅ Email verified successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Email verification error:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ NOUVELLE MÉTHODE: Renvoyer l'email de vérification
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/resend-verification`, { email }).pipe(
      tap(response => {
        console.log('✅ Verification email resent:', response);
      }),
      catchError(error => {
        console.error('❌ Resend verification error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
  }

  private setSession(authResponse: AuthResponse): void {
    console.log('💾 Setting session with:', authResponse);
    
    if (!authResponse.token) {
      console.error('❌ No token in response!');
      return;
    }
    
    localStorage.setItem('token', authResponse.token);
    console.log('✅ Token saved:', authResponse.token.substring(0, 20) + '...');
    
    const user: User = {
      userId: authResponse.userId,
      email: authResponse.email,
      firstName: authResponse.firstName,
      lastName: authResponse.lastName,
      role: authResponse.role
    };
    
    console.log('✅ User object created:', user);
    console.log('✅ User role:', user.role);
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    
    console.log('✅ Session saved successfully');
    console.log('   - Token in localStorage:', !!localStorage.getItem('token'));
    console.log('   - User in localStorage:', !!localStorage.getItem('currentUser'));
    console.log('   - currentUserSubject value:', this.currentUserSubject.value);
    console.log('   - isLoggedIn:', this.isLoggedIn);
    console.log('   - isAdmin:', this.isAdmin);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }
}