import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IEvent } from '../../../../../_core/model/event.interface';
import { ILocation } from '../../../../../_core/model/location.interface';
import { ICategory } from '../../../../../_core/model/category.interface';

@Component({
  selector: 'app-event-detail-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './event-detail-header.component.html',
  host: {
    class: 'block'
  },
  styleUrl: './event-detail-header.component.css'
})
export class EventDetailHeaderComponent {
  @Input() event!: IEvent;
  @Input() location: ILocation | null = null;
  @Input() category: ICategory | null = null;
  @Input() isDeleting = false;

  @Output() back = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() viewStats = new EventEmitter<void>();

  isEventUpcoming(): boolean {
    if (!this.event) return false;
    return new Date(this.event.startedAt) > new Date();
  }

  isEventOngoing(): boolean {
    if (!this.event) return false;
    const now = new Date();
    return new Date(this.event.startedAt) <= now && new Date(this.event.endAt) >= now;
  }

  isEventPast(): boolean {
    if (!this.event) return false;
    return new Date(this.event.endAt) < new Date();
  }

  /** Même encodage que la liste : à venir → primary, en cours → success, terminé → gris. */
  getStatusKey(): 'upcoming' | 'ongoing' | 'past' {
    if (this.isEventOngoing()) return 'ongoing';
    if (this.isEventPast()) return 'past';
    return 'upcoming';
  }

  getStatusLabel(): string {
    switch (this.getStatusKey()) {
      case 'ongoing':
        return 'En cours';
      case 'past':
        return 'Terminé';
      default:
        return 'À venir';
    }
  }

  /**
   * Repère temporel lisible (« Dans 5 jours », « Il y a 2 mois ») : la date seule
   * oblige l'utilisateur à calculer lui-même l'échéance.
   */
  getRelativeLabel(): string {
    if (!this.event) return '';

    const now = new Date();
    const start = new Date(this.event.startedAt);
    const end = new Date(this.event.endAt);

    if (this.isEventOngoing()) {
      return `Se termine ${this.formatDistance(end.getTime() - now.getTime(), 'dans')}`;
    }
    if (this.isEventPast()) {
      return `Terminé ${this.formatDistance(now.getTime() - end.getTime(), 'il y a')}`;
    }
    return `Débute ${this.formatDistance(start.getTime() - now.getTime(), 'dans')}`;
  }

  private formatDistance(milliseconds: number, prefix: 'dans' | 'il y a'): string {
    const minutes = Math.max(1, Math.round(Math.abs(milliseconds) / 60000));

    if (minutes < 60) {
      return `${prefix} ${minutes} min`;
    }
    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return `${prefix} ${hours} h`;
    }
    const days = Math.round(hours / 24);
    if (days < 31) {
      return `${prefix} ${days} jour${days > 1 ? 's' : ''}`;
    }
    const months = Math.round(days / 30);
    if (months < 12) {
      return `${prefix} ${months} mois`;
    }
    const years = Math.round(months / 12);
    return `${prefix} ${years} an${years > 1 ? 's' : ''}`;
  }
}
