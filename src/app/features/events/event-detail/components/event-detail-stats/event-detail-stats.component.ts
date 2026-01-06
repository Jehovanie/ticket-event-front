import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ILocation } from '../../../../../_core/model/location.interface';

@Component({
  selector: 'app-event-detail-stats',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './event-detail-stats.component.html',
  styleUrl: './event-detail-stats.component.css'
})
export class EventDetailStatsComponent {
  @Input() totalTickets: number = 0;
  @Input() totalRevenue: number = 0;
  @Input() ticketTypesCount: number = 0;
  @Input() location: ILocation | null = null;
}
