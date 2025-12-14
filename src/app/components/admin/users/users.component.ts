// src/app/components/admin/users/users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService, UserList, CreateUserRequest, UpdateUserRequest } from '../../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: UserList[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;
  totalPages = 0;

  // Filtres
  searchTerm = '';
  selectedRole = '';
  availableRoles: string[] = [];

  // Modale
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: UserList | null = null;

  // Formulaire
  userForm = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'Customer',
    isActive: true
  };

  // Confirmation de suppression
  showDeleteConfirm = false;
  userToDelete: UserList | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.availableRoles = this.userService.getAvailableRoles();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers(this.currentPage, this.pageSize, this.searchTerm, this.selectedRole)
      .subscribe({
        next: (response) => {
          console.log('📊 Users loaded:', response);
          this.users = response.data || [];
          this.totalUsers = response.totalCount || 0;
          this.totalPages = response.totalPages || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error loading users:', error);
          this.errorMessage = 'Erreur lors du chargement des utilisateurs';
          this.loading = false;
        }
      });
  }

  // Recherche et filtres
  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onRoleFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Modale
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(user: UserList): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.userForm = {
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      isActive: user.isActive
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
    this.selectedUser = null;
  }

  resetForm(): void {
    this.userForm = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'Customer',
      isActive: true
    };
  }

  // CRUD Operations
  onSubmit(): void {
    if (this.modalMode === 'create') {
      this.createUser();
    } else {
      this.updateUser();
    }
  }

  createUser(): void {
    const request: CreateUserRequest = {
      email: this.userForm.email,
      password: this.userForm.password,
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      phoneNumber: this.userForm.phoneNumber || undefined,
      role: this.userForm.role
    };

    this.userService.createUser(request).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur créé avec succès';
        this.closeModal();
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error creating user:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de l\'utilisateur';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    const request: UpdateUserRequest = {
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      phoneNumber: this.userForm.phoneNumber || undefined,
      role: this.userForm.role,
      isActive: this.userForm.isActive
    };

    this.userService.updateUser(this.selectedUser.userId, request).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur mis à jour avec succès';
        this.closeModal();
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error updating user:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  openDeleteConfirm(user: UserList): void {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.userService.deleteUser(this.userToDelete.userId).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur supprimé avec succès';
        this.closeDeleteConfirm();
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error deleting user:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression de l\'utilisateur';
        this.closeDeleteConfirm();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // Toggle status
  toggleUserStatus(user: UserList): void {
    this.userService.toggleUserStatus(user.userId, !user.isActive).subscribe({
      next: () => {
        this.successMessage = `Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès`;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error toggling user status:', error);
        this.errorMessage = 'Erreur lors du changement de statut';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // Helpers
  getRoleBadgeClass(role: string): string {
    return role === 'Admin' ? 'role-admin' : 'role-customer';
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}