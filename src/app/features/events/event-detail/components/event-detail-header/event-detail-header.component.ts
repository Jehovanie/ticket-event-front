import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IEvent } from '../../../../../_core/model/event.interface';

@Component({
  selector: 'app-event-detail-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './event-detail-header.component.html',
  styleUrl: './event-detail-header.component.css'
})
export class EventDetailHeaderComponent {
  @Input() event!: IEvent;
  @Input() isDeleting = false;
  
  @Output() back = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

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
}
