import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import {
  NotificationComponent,
  NotificationData,
  NotificationType,
} from '../components/notification/notification.component';

/**
 * Point d'entrée unique des notifications.
 *
 * Chaque composant appelait `MatSnackBar` avec ses propres options : durées,
 * position et libellé d'action variaient d'une page à l'autre, et le style
 * n'existait que dans le CSS de la fiche détail. Tout est centralisé ici.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, title?: string): void {
    this.open({ type: 'success', message, title }, 4000);
  }

  /** Les erreurs restent plus longtemps : on a besoin de les lire. */
  error(message: string, title?: string): void {
    this.open({ type: 'error', message, title }, 7000);
  }

  info(message: string, title?: string): void {
    this.open({ type: 'info', message, title }, 4000);
  }

  private open(data: NotificationData, duration: number): void {
    const config: MatSnackBarConfig<NotificationData> = {
      data,
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      // Neutralise le fond sombre du conteneur Material (voir styles.css).
      panelClass: ['app-notification', `app-notification-${data.type satisfies NotificationType}`],
    };

    this.snackBar.openFromComponent(NotificationComponent, config);
  }
}
