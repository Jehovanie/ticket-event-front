import { Component } from '@angular/core';
import { ListEventComponent } from './components/list-event/list-event.component';
import { FilterEventComponent } from './components/filter-event/filter-event.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  imports: [
    ListEventComponent,
    FilterEventComponent,
    CreateEventComponent,
    LoadingComponent,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  isLoading = true;

  constructor() {
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }
}
