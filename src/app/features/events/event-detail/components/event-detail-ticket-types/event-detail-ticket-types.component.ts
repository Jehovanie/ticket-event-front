import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ITicketType } from '../../../../../_core/model/ticket-type.interface';
import { TitleCaseDateFrPipe } from '../../../../../_shared/pipes/titleCaseDateFr';

@Component({
  selector: 'app-event-detail-ticket-types',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TitleCaseDateFrPipe],
  templateUrl: './event-detail-ticket-types.component.html',
  styleUrl: './event-detail-ticket-types.component.css'
})
export class EventDetailTicketTypesComponent {
  @Input() ticketTypes: ITicketType[] = [];
  @Input() totalTickets: number = 0;
  @Input() totalRevenue: number = 0;
  
  @Output() viewStats = new EventEmitter<void>();

  getTicketTypesCount(): number {
    return this.ticketTypes.length;
  }
}
