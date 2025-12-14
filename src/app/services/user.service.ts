// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserList {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserDetail {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: [];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs avec pagination
  getUsers(pageNumber: number = 1, pageSize: number = 10, searchTerm?: string, role?: string): Observable<PaginatedResponse<UserList>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<PaginatedResponse<UserList>>(this.apiUrl, { params });
  }

  // Récupérer un utilisateur par ID
  getUserById(userId: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.apiUrl}/${userId}`);
  }

  // Créer un nouvel utilisateur
  createUser(user: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, user);
  }

  // Mettre à jour un utilisateur
  updateUser(userId: number, user: UpdateUserRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, user);
  }

  // Supprimer un utilisateur
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // Changer le rôle d'un utilisateur
  changeUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/role`, { role: newRole });
  }

  // Activer/Désactiver un utilisateur
  toggleUserStatus(userId: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/status`, { isActive });
  }

  // Réinitialiser le mot de passe
  resetPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/reset-password`, { newPassword });
  }

  // Obtenir les rôles disponibles
  getAvailableRoles(): string[] {
    return ['Admin', 'Customer'];
  }
}