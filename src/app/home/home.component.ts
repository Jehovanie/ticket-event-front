import { Component } from '@angular/core';
import { ListEventComponent } from './components/list-event/list-event.component';
import { FilterEventComponent } from './components/filter-event/filter-event.component';
import { CreateEventComponent } from './components/create-event/create-event.component';

@Component({
  selector: 'app-home',
  imports: [ListEventComponent, FilterEventComponent, CreateEventComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

}
