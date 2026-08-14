import { AuthService } from '@/app/_core/services/auth/auth.service';
import { BtnLoadingComponent } from '@/app/_shared/components/btn-loading/btn-loading.component';
import { NotificationService } from '@/app/_shared/services/notification.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, BtnLoadingComponent],
  templateUrl: './login.component.html',
  host: {
    class: 'block'
  },
  styles: ``
})
export class LoginComponent {
  readonly email = signal('');
  readonly password = signal('');
  readonly remember = signal(true);
  readonly showPassword = signal(false);

  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isValidEmail = computed(() => /^\S+@\S+\.\S+$/.test(this.email().trim()));
  readonly isValidPassword = computed(() => this.password().length > 0);
  readonly isFormValid = computed(() => this.isValidEmail() && this.isValidPassword());

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.auth
      .login(
        { email: this.email().trim().toLowerCase(), password: this.password() },
        this.remember()
      )
      .subscribe({
        next: (user) => {
          this.isSubmitting.set(false);
          this.notification.success(
            `Content de vous revoir, ${user.firstname ?? ''}`.trim() + '.',
            'Connexion réussie'
          );

          // On revient là où l'utilisateur voulait aller avant d'être redirigé.
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(this.toMessage(error));
        },
      });
  }

  /** Traduit l'erreur HTTP en message utile plutôt qu'en code. */
  private toMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return "Le serveur est injoignable. Vérifiez que l'API est démarrée.";
    }
    if (error.status === 401) {
      return 'Email ou mot de passe incorrect.';
    }
    return (
      error.error?.message ??
      "La connexion a échoué. Réessayez dans un instant."
    );
  }
}
