import { AuthService } from '@/app/_core/services/auth/auth.service';
import { BtnLoadingComponent } from '@/app/_shared/components/btn-loading/btn-loading.component';
import { NotificationService } from '@/app/_shared/services/notification.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, BtnLoadingComponent],
  templateUrl: './register.component.html',
  host: {
    class: 'block'
  },
  styles: ``
})
export class RegisterComponent {
  readonly firstname = signal('');
  readonly lastname = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly phone = signal('');
  readonly showPassword = signal(false);

  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Règles alignées sur `RegisterDTO` côté API. */
  readonly isValidFirstname = computed(() => {
    const value = this.firstname().trim();
    return value.length > 0 && value.length <= 50;
  });
  readonly isValidLastname = computed(() => {
    const value = this.lastname().trim();
    return value.length > 0 && value.length <= 50;
  });
  readonly isValidEmail = computed(() => /^\S+@\S+\.\S+$/.test(this.email().trim()));
  readonly isValidPassword = computed(() => {
    const length = this.password().length;
    return length >= 4 && length <= 72;
  });
  readonly isValidConfirmation = computed(
    () => this.confirmPassword().length > 0 && this.confirmPassword() === this.password()
  );
  readonly isValidPhone = computed(() => this.phone().trim().length <= 30);

  readonly isFormValid = computed(
    () =>
      this.isValidFirstname() &&
      this.isValidLastname() &&
      this.isValidEmail() &&
      this.isValidPassword() &&
      this.isValidConfirmation() &&
      this.isValidPhone()
  );

  /**
   * Robustesse indicative du mot de passe (0 à 4). L'API n'exige que 4
   * caractères ; ce repère encourage mieux sans bloquer.
   */
  readonly passwordScore = computed(() => {
    const value = this.password();
    if (value.length === 0) {
      return 0;
    }

    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score++;

    return Math.min(4, Math.max(1, score));
  });

  readonly passwordLabel = computed(() => {
    switch (this.passwordScore()) {
      case 0:
        return '';
      case 1:
        return 'Faible';
      case 2:
        return 'Moyen';
      case 3:
        return 'Bon';
      default:
        return 'Excellent';
    }
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const phone = this.phone().trim();

    this.auth
      .register({
        firstname: this.firstname().trim(),
        lastname: this.lastname().trim(),
        email: this.email().trim().toLowerCase(),
        password: this.password(),
        phone: phone.length > 0 ? phone : null,
        language: 'fr',
      })
      .subscribe({
        next: (user) => {
          this.isSubmitting.set(false);
          // L'inscription renvoie déjà les jetons : inutile de repasser par le login.
          this.notification.success(
            `Bienvenue ${user.firstname ?? ''}, votre espace est prêt.`.trim(),
            'Compte créé'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(this.toMessage(error));
        },
      });
  }

  private toMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return "Le serveur est injoignable. Vérifiez que l'API est démarrée.";
    }

    const apiMessage: string = error.error?.detail ?? error.error?.message ?? '';

    // L'API remonte les violations de `RegisterDTO` dans une exception générique.
    if (/unique|duplicate|already/i.test(apiMessage)) {
      return 'Un compte existe déjà avec cette adresse email.';
    }
    if (/invalid registration data/i.test(apiMessage)) {
      return "Les informations saisies n'ont pas été acceptées : vérifiez l'email et le mot de passe.";
    }

    return apiMessage || "La création du compte a échoué. Réessayez dans un instant.";
  }
}
