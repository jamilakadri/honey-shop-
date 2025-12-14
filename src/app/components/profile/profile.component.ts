import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  isEditing = false;
  isChangingPassword = false;
  isEditingPhone = false;
  
  user: any = null;
  
  // Password change
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  // Phone data
  phoneData = '';
  phoneErrorMessage = '';
  phoneSuccessMessage = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.user = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phoneNumber || null,
        role: currentUser.role,
        userId: currentUser.userId
      };
    }
  }

  togglePhoneEdit() {
    this.isEditingPhone = true;
    this.phoneData = this.user.phone || '';
    this.phoneErrorMessage = '';
    this.phoneSuccessMessage = '';
  }

  cancelPhoneEdit() {
    this.isEditingPhone = false;
    this.phoneData = '';
    this.phoneErrorMessage = '';
    this.phoneSuccessMessage = '';
  }

  // Fix the savePhone method with proper types
  savePhone() {
    this.phoneErrorMessage = '';
    this.phoneSuccessMessage = '';

    // Validation simple
    if (this.phoneData && this.phoneData.trim().length < 8) {
      this.phoneErrorMessage = 'Le numéro de téléphone doit contenir au moins 8 chiffres';
      return;
    }

    // Appel API pour sauvegarder le téléphone
    this.authService.updatePhone(this.phoneData).subscribe({
      next: (response: any) => {  // Add type annotation
        this.user.phone = this.phoneData;
        this.phoneSuccessMessage = 'Numéro de téléphone mis à jour avec succès!';
        setTimeout(() => {
          this.isEditingPhone = false;
          this.phoneSuccessMessage = '';
        }, 2000);
      },
      error: (error: any) => {  // Add type annotation
        this.phoneErrorMessage = error.error?.message || 'Échec de la mise à jour du numéro';
      }
    });
  }

  togglePasswordChange() {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  changePassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.passwordData.newPassword !== this.passwordData.confirmNewPassword) {
      this.errorMessage = 'Les nouveaux mots de passe ne correspondent pas';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.authService.changePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword,
      this.passwordData.confirmNewPassword
    ).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe changé avec succès!';
        this.togglePasswordChange();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Échec du changement de mot de passe';
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}