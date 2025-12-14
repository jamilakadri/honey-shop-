// src/app/components/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '/';
  showResendLink = false; // ✅ NOUVEAU
  emailNotVerified = false; // ✅ NOUVEAU
  userEmail = ''; // ✅ NOUVEAU

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    // ✅ Vérifier si on arrive depuis l'inscription
    const message = this.route.snapshot.queryParams['message'];
    const email = this.route.snapshot.queryParams['email'];
    
    if (message === 'verify-email') {
      this.successMessage = '✅ Inscription réussie ! Veuillez vérifier votre email avant de vous connecter.';
      if (email) {
        this.loginData.email = email;
        this.userEmail = email;
      }
    }
  }

  onSubmit(): void {
    console.log('🔵 Login attempt with:', this.loginData);
    
    this.errorMessage = '';
    this.successMessage = '';
    this.showResendLink = false;
    this.emailNotVerified = false;
    this.loading = true;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        this.successMessage = 'Connexion réussie ! Redirection...';
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl);
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
        
        // ✅ Vérifier si c'est une erreur d'email non vérifié
        const errorMsg = error.error?.message || error.message || '';
        
        if (errorMsg.toLowerCase().includes('vérifier votre email') || 
            errorMsg.toLowerCase().includes('verify') ||
            errorMsg.toLowerCase().includes('email avant de vous connecter')) {
          
          this.emailNotVerified = true;
          this.showResendLink = true;
          this.userEmail = this.loginData.email;
          this.errorMessage = ' Votre email n\'est pas encore vérifié. Veuillez vérifier votre boîte de réception.';
          
        } else {
          this.errorMessage = errorMsg || 'Email ou mot de passe incorrect';
        }
        
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // ✅ NOUVEAU: Rediriger vers la page de renvoi d'email
  goToResendVerification(): void {
    this.router.navigate(['/resend-verification'], {
      queryParams: { email: this.userEmail }
    });
  }
}