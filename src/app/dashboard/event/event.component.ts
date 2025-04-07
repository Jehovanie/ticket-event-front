import { Component } from '@angular/core';
import { ListConsumerComponent } from './components/list-consumer/list-consumer.component';
import { FilterConsumerComponent } from './components/filter-consumer/filter-consumer.component';
import { StateEventComponent } from './components/state-event/state-event.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event',
  imports: [
    RouterLink,
    ListConsumerComponent,
    FilterConsumerComponent,
    StateEventComponent,
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent {}
