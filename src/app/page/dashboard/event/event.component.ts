import { Component, OnInit } from '@angular/core';
import { ListConsumerComponent } from './components/list-consumer/list-consumer.component';
import { FilterConsumerComponent } from './components/filter-consumer/filter-consumer.component';
import { StateEventComponent } from './components/state-event/state-event.component';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { UsersService } from '../../../_core/services/users/users.service';
import { IEvent } from '../../../_core/model/event.interface';
import { IUser } from '../../../_core/model/user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListConsumerComponent,
    FilterConsumerComponent,
    StateEventComponent,
    LoadingComponent,
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent implements OnInit {
  isLoadingListConsumer = true;
  isLoadingStateEvent = true;

  consumer$!: Observable<{
    isLoadingListConsumer: boolean;
    errorListConsumer: string | null;
    consumers: IUser[];
  }>;

  stateEvent$!: Observable<{
    isLoadingStateEvent: boolean;
    errorStateEvent: string;
    stateEvent: IEvent;
  }>;

  constructor(private usersService: UsersService) {
    setTimeout(() => {
      this.isLoadingListConsumer = false;
      this.isLoadingStateEvent = false;
    }, 3000);
  }

  ngOnInit(): void {
    this.subscribeConsumer();
  }

  subscribeConsumer() {
    this.consumer$ = this.usersService.getAll('/users').pipe(
      map((data) => ({
        isLoadingListConsumer: false,
        errorListConsumer: null,
        consumers: data,
      })),
      startWith({
        isLoadingListConsumer: true,
        errorListConsumer: null,
        consumers: [],
      }),
      catchError((error) =>
        of({
          isLoadingListConsumer: false,
          errorListConsumer: error,
          consumers: [],
        })
      )
    );
  }
}
