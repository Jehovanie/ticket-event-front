import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ITicketType } from '../../../../../_core/model/ticket-type.interface';
import { AriaryPipe } from '../../../../../_shared/pipes/ariary.pipe';

@Component({
  selector: 'app-event-detail-ticket-types',
  standalone: true,
  imports: [CommonModule, MatIconModule, AriaryPipe],
  templateUrl: './event-detail-ticket-types.component.html',
  host: {
    class: 'block'
  },
  styleUrl: './event-detail-ticket-types.component.css'
})
export class EventDetailTicketTypesComponent {
  @Input() ticketTypes: ITicketType[] = [];
  @Input() totalTickets: number = 0;
  @Input() totalRevenue: number = 0;

  @Output() viewStats = new EventEmitter<void>();

  /** Teintes de repérage des tarifs, réutilisées entre la pastille et la barre. */
  private readonly accents = [
    { dot: 'bg-primary-500', bar: 'bg-primary-500' },
    { dot: 'bg-secondary-500', bar: 'bg-secondary-500' },
    { dot: 'bg-success-500', bar: 'bg-success-500' },
    { dot: 'bg-warning-500', bar: 'bg-warning-500' },
    { dot: 'bg-primary-300', bar: 'bg-primary-300' },
  ];

  getTicketTypesCount(): number {
    return this.ticketTypes.length;
  }

  getAccent(index: number): { dot: string; bar: string } {
    return this.accents[index % this.accents.length];
  }

  getRevenue(ticketType: ITicketType): number {
    return (ticketType.prix ?? 0) * (ticketType.quantite_max ?? 0);
  }

  /** Part du quota de ce tarif dans la capacité totale de la billetterie. */
  getSharePercent(ticketType: ITicketType): number {
    if (this.totalTickets <= 0) {
      return 0;
    }
    return Math.round(((ticketType.quantite_max ?? 0) / this.totalTickets) * 100);
  }
}
