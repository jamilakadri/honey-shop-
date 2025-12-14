import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resend-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="resend-container">
      <div class="resend-card">
        <div class="icon">📧</div>
        <h2>Renvoyer l'email de vérification</h2>
        <p class="subtitle">
          Vous n'avez pas reçu l'email de vérification?
          Entrez votre adresse email et nous vous en enverrons un nouveau.
        </p>

        <form (ngSubmit)="onSubmit()" *ngIf="!success">
          <div class="form-group">
            <label for="email">Adresse email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              placeholder="votre@email.com"
              required
              [disabled]="loading"
            />
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || !email">
            <span *ngIf="!loading">Renvoyer l'email</span>
            <span *ngIf="loading">Envoi en cours...</span>
          </button>
        </form>

        <div *ngIf="success" class="success-message">
          <div class="icon-success">✓</div>
          <h3>Email envoyé! 🎉</h3>
          <p>Vérifiez votre boîte de réception et cliquez sur le lien de vérification.</p>
          <button class="btn-secondary" (click)="goToLogin()">
            Retour à la connexion
          </button>
        </div>

        <div class="footer-links">
          <a (click)="goToLogin()">Retour à la connexion</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resend-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .resend-card {
      background: white;
      border-radius: 20px;
      padding: 50px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 28px;
    }

    .subtitle {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }

    label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
    }

    input {
      width: 100%;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    .btn-primary, .btn-secondary {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .success-message {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
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

    @keyframes scaleIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    h3 {
      color: #333;
      margin-bottom: 10px;
    }

    .success-message p {
      color: #666;
      margin-bottom: 20px;
    }

    .footer-links {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #e0e0e0;
    }

    .footer-links a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }
  `]
})
export class ResendVerificationComponent implements OnInit {
  email = '';
  loading = false;
  success = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // ✅ AJOUTÉ
  ) {}

  // ✅ AJOUTÉ: Préremplir l'email si fourni dans les paramètres
  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParams['email'];
    if (emailParam) {
      this.email = emailParam;
    }
  }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre adresse email';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (response) => {
        console.log('✅ Verification email resent:', response);
        this.loading = false;
        this.success = true;
      },
      error: (error) => {
        console.error('❌ Resend error:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'envoi de l\'email';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}