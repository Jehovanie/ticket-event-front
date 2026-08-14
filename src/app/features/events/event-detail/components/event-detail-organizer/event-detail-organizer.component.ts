import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IOrganizer } from '../../../../../_core/model/organizer.interface';

/**
 * Pied de page de la fiche événement : la signature de l'organisateur.
 *
 * Traité en bandeau sombre pleine largeur plutôt qu'en carte blanche parmi les
 * autres : il clôt la page et ses moyens de contact sont des actions, pas des
 * données à lire.
 */
@Component({
  selector: 'app-event-detail-organizer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './event-detail-organizer.component.html',
  host: {
    class: 'block'
  },
  styles: ``
})
export class EventDetailOrganizerComponent {
  @Input() organizer: IOrganizer | null = null;

  /** Initiales de l'organisateur, à défaut de logo. */
  get organizerInitials(): string {
    return (this.organizer?.name ?? '?')
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  /** Adresse du site sans le protocole : plus lisible dans une pastille. */
  get websiteLabel(): string {
    return (this.organizer?.website ?? '')
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
  }
}
