import { Component, Input } from '@angular/core';
import { IEvent } from '../../../../../_core/model/event.interface';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TitleCaseDateFrPipe } from '../../../../../pipe/titleCaseDateFr';

@Component({
  selector: 'app-list-event',
  imports: [CommonModule, RouterLink, TitleCaseDateFrPipe],
  templateUrl: './list-event.component.html',
  styleUrl: './list-event.component.css',
})
export class ListEventComponent {
  @Input() events!: IEvent[];

  constructor() {}
}
