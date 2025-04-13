import { Component, Input } from '@angular/core';
import { IEvent } from '../../../../../_core/model/event.interface';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-event',
  imports: [
    CommonModule, 
    RouterLink
  ],
  templateUrl: './list-event.component.html',
  styleUrl: './list-event.component.css',
})
export class ListEventComponent {
  @Input() events!: IEvent[];

  constructor() {
   
  }
}
