import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationData {
  type: NotificationType;
  message: string;
  /** Titre court optionnel, quand le message mérite une accroche. */
  title?: string;
}

/**
 * Contenu des notifications de l'application.
 *
 * Le conteneur Material par défaut est une barre sombre sans icône : difficile
 * de distinguer un succès d'une erreur d'un coup d'œil. On garde le mécanisme
 * (file d'attente, durée, accessibilité) mais on remplace le rendu.
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="flex items-start gap-3 w-full max-w-md rounded-xl bg-white border-l-4 shadow-lg ring-1 ring-gray-200 px-4 py-3"
      [ngClass]="{
        'border-success-500': data.type === 'success',
        'border-danger-500': data.type === 'error',
        'border-primary-500': data.type === 'info'
      }"
      role="status"
    >
      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
        [ngClass]="{
          'bg-success-50 text-success-600': data.type === 'success',
          'bg-danger-50 text-danger-600': data.type === 'error',
          'bg-primary-50 text-primary-700': data.type === 'info'
        }"
      >
        <mat-icon class="!w-5 !h-5 !text-xl">{{ icon }}</mat-icon>
      </span>

      <div class="min-w-0 flex-1 pt-0.5">
        <p *ngIf="data.title" class="text-sm font-semibold text-gray-900">{{ data.title }}</p>
        <p class="text-sm leading-5" [ngClass]="data.title ? 'mt-0.5 text-gray-500' : 'text-gray-800'">
          {{ data.message }}
        </p>
      </div>

      <button
        type="button"
        (click)="dismiss()"
        aria-label="Fermer la notification"
        class="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <mat-icon class="!w-4 !h-4 !text-base">close</mat-icon>
      </button>
    </div>
  `,
  styles: ``
})
export class NotificationComponent {
  readonly data = inject<NotificationData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject(MatSnackBarRef);

  get icon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error_outline';
      default:
        return 'info';
    }
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
