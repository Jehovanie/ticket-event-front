import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEvent } from '../../../../../_core/model/event.interface';
import { ICategory } from '../../../../../_core/model/category.interface';
import { ILocation } from '../../../../../_core/model/location.interface';

/**
 * Colonne latérale de la fiche événement : dates et lieu.
 * L'organisateur est traité à part, en pied de page.
 */
@Component({
  selector: 'app-event-detail-metadata',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './event-detail-metadata.component.html',
  host: {
    class: 'block'
  },
  styleUrl: './event-detail-metadata.component.css'
})
export class EventDetailMetadataComponent {
  @Input() event!: IEvent;
  @Input() category: ICategory | null = null;
  @Input() location: ILocation | null = null;

  /** Une date de fin antérieure au début est une donnée à corriger : on le dit. */
  get hasInvalidDateRange(): boolean {
    if (!this.event) return false;
    return new Date(this.event.endAt) < new Date(this.event.startedAt);
  }

  /** Durée entre début et fin, en unité lisible. */
  getDurationLabel(): string {
    if (!this.event || this.hasInvalidDateRange) {
      return '—';
    }

    const milliseconds =
      new Date(this.event.endAt).getTime() -
      new Date(this.event.startedAt).getTime();
    const minutes = Math.max(1, Math.round(milliseconds / 60000));

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} h ${remainingMinutes}` : `${hours} h`;
    }

    const days = Math.round(hours / 24);
    if (days < 31) {
      return `${days} jour${days > 1 ? 's' : ''}`;
    }

    const months = Math.round(days / 30);
    return `${months} mois`;
  }
}
