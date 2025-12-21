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

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    // Check if redirected from registration
    const message = this.route.snapshot.queryParams['message'];
    
    if (message === 'registered') {
      this.successMessage = '✅ Inscription réussie ! Vous pouvez maintenant vous connecter.';
    }
  }

  onSubmit(): void {
    console.log('🔵 Login attempt with:', this.loginData);
    
    this.errorMessage = '';
    this.successMessage = '';
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
        
        const errorMsg = error.error?.message || error.message || '';
        this.errorMessage = errorMsg || 'Email ou mot de passe incorrect';
        
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}