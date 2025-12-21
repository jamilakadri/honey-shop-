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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate passwords match
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('✅ Registration successful - Auto logged in');
        
        // ✅ Auto-logged in by auth service
        this.successMessage = '✅ Inscription réussie ! Redirection...';
        
        // ✅ Redirect to home after 1 second
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        
        // Check if it's an invalid email error
        const errorMsg = error.error?.message || error.message || '';
        
        if (errorMsg.toLowerCase().includes('email') && 
            (errorMsg.toLowerCase().includes('invalid') || 
             errorMsg.toLowerCase().includes('invalide') ||
             errorMsg.toLowerCase().includes("n'existe pas"))) {
          this.errorMessage = '❌ Cette adresse email semble invalide ou n\'existe pas. Veuillez vérifier.';
        } else {
          this.errorMessage = errorMsg || 'Erreur lors de l\'inscription';
        }
        
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}