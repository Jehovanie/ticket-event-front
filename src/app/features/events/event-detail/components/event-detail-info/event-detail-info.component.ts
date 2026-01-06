import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IEvent } from '../../../../../_core/model/event.interface';
import { ILocation } from '../../../../../_core/model/location.interface';
import { TitleCaseDateFrPipe } from '../../../../../_shared/pipes/titleCaseDateFr';

@Component({
  selector: 'app-event-detail-info',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TitleCaseDateFrPipe],
  templateUrl: './event-detail-info.component.html',
  styleUrl: './event-detail-info.component.css',
  host: {
    class: 'lg:col-span-2 space-y-6 block'
  }
})
export class EventDetailInfoComponent {
  @Input() event!: IEvent;
  @Input() location: ILocation | null = null;
  @Input() currentImageIndex: number = 0;

  @Output() previousImage = new EventEmitter<void>();
  @Output() nextImage = new EventEmitter<void>();
}
