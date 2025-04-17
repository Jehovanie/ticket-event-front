import { Component, OnInit } from '@angular/core';
import { ListConsumerComponent } from './components/list-consumer/list-consumer.component';
import { FilterConsumerComponent } from './components/filter-consumer/filter-consumer.component';
import { StateEventComponent } from './components/state-event/state-event.component';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { UsersService } from '../../../_core/services/users/users.service';
import { IUser } from '../../../_core/model/user.interface';
import { CommonModule } from '@angular/common';

export type EventStateType = {
  statusTicket: {
    global: { [key: string]: number }[];
    actuel: { [key: string]: number }[];
    filter: {
      time: string;
      value: { [key: string]: number }[];
    };
  };
};

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
  consumer$!: Observable<{
    isLoadingListConsumer: boolean;
    errorListConsumer: string | null;
    consumers: IUser[];
  }>;

  eventStates: {
    isLoading: boolean;
    value: EventStateType;
    error: any[];
  } = {
    isLoading: false,
    value: {
      statusTicket: {
        global: [],
        actuel: [],
        filter: { time: '', value: [] },
      },
    },
    error: [],
  };

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.subscribeConsumer();
    this.initEventState();
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

  initEventState() {
    this.eventStates = {
      isLoading: false,
      value: {
        statusTicket: {
          global: [{ vip: 150 }, { gold: 200 }, { fanzone: 300 }],
          actuel: [{ vip: 113 }, { gold: 182 }, { fanzone: 254 }],
          filter: {
            time: '2023-10-01',
            value: [{ vip: 131 }, { gold: 7 }, { fanzone: 51 }],
          },
        },
      },
      error: [],
    };
  }
}
