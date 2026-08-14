import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEvent } from '../../../../../_core/model/event.interface';

@Component({
  selector: 'app-event-detail-info',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './event-detail-info.component.html',
  styleUrl: './event-detail-info.component.css',
  host: {
    class: 'lg:col-span-2 space-y-5 block'
  }
})
export class EventDetailInfoComponent {
  @Input() event!: IEvent;
  @Input() currentImageIndex: number = 0;

  @Output() previousImage = new EventEmitter<void>();
  @Output() nextImage = new EventEmitter<void>();
}
