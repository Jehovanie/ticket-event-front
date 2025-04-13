import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IEvent } from '../../../../../_core/model/event.interface';
import { EventsService } from '../../../../../_core/services/events/events.service';

@Component({
  selector: 'app-list-event',
  imports: [
    RouterLink,
  ],
  templateUrl: './list-event.component.html',
  styleUrl: './list-event.component.css'
})
export class ListEventComponent implements OnInit {

  private dataEvents!: {
    events: IEvent[],
    isLoading: boolean,
    error: string | null
  }

  private eventsService!: EventsService

  constructor(){

  }

  ngOnInit() {
    // Initialization logic here
  }
}
