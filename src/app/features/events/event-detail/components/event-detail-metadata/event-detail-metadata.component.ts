import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEvent } from '../../../../../_core/model/event.interface';
import { ICategory } from '../../../../../_core/model/category.interface';
import { IOrganizer } from '../../../../../_core/model/organizer.interface';
import { TitleCaseDateFrPipe } from '../../../../../_shared/pipes/titleCaseDateFr';

@Component({
  selector: 'app-event-detail-metadata',
  standalone: true,
  imports: [CommonModule, MatIconModule, TitleCaseDateFrPipe],
  templateUrl: './event-detail-metadata.component.html',
  styleUrl: './event-detail-metadata.component.css'
})
export class EventDetailMetadataComponent {
  @Input() event!: IEvent;
  @Input() category: ICategory | null = null;
  @Input() organizer: IOrganizer | null = null;
}
