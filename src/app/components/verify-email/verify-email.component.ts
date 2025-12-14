import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-email-container">
      <div class="verify-email-card">
        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <h2>Vérification en cours...</h2>
          <p>Veuillez patienter</p>
        </div>

        <div *ngIf="!loading && success" class="success">
          <div class="icon-success">✓</div>
          <h2>Email vérifié avec succès! 🎉</h2>
          <p>Votre compte a été activé.</p>
          <p>Vous pouvez maintenant vous connecter.</p>
          <button class="btn-primary" (click)="goToLogin()">
            Se connecter
          </button>
        </div>

        <div *ngIf="!loading && !success" class="error">
          <div class="icon-error">✕</div>
          <h2>Erreur de vérification</h2>
          <p>{{ errorMessage }}</p>
          <button class="btn-secondary" (click)="goToHome()">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-email-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .verify-email-card {
      background: white;
      border-radius: 20px;
      padding: 60px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .loading, .success, .error {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .icon-success {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #4caf50;
      color: white;
      font-size: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: scaleIn 0.5s ease-out;
    }

    .icon-error {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f44336;
      color: white;
      font-size: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 28px;
    }

    p {
      color: #666;
      margin-bottom: 10px;
      font-size: 16px;
      line-height: 1.6;
    }

    .btn-primary, .btn-secondary {
      margin-top: 30px;
      padding: 15px 40px;
      border: none;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.success = false;
      this.errorMessage = 'Token de vérification manquant';
      return;
    }

    this.verifyEmail(token);
  }

  verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        console.log('✅ Email verified:', response);
        this.loading = false;
        this.success = true;
      },
      error: (error) => {
        console.error('❌ Verification error:', error);
        this.loading = false;
        this.success = false;
        this.errorMessage = error.error?.message || 'Le token est invalide ou a expiré';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}