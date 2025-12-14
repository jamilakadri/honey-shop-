// src/app/components/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';
  showEmailVerificationMessage = false; // ✅ NOUVEAU

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showEmailVerificationMessage = false;

    // Validation des mots de passe
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('✅ Registration successful');
        
        // ✅ NE PAS connecter automatiquement
        // Afficher le message de vérification d'email
        this.showEmailVerificationMessage = true;
        this.successMessage = '📧 Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.';
        
        // ✅ Rediriger vers login après 5 secondes
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { 
              message: 'verify-email',
              email: this.registerData.email 
            }
          });
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // ✅ NOUVEAU: Méthode pour renvoyer l'email
  resendVerificationEmail(): void {
    this.router.navigate(['/resend-verification']);
  }
}