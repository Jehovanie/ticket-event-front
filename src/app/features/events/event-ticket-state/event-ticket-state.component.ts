import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsService } from '@/app/_core/services/events/events.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IEvent, IEventStatusTicket } from '@/app/_core/model';
import { StateEventComponent } from './components/state-event/state-event.component';
import { LoadingComponent } from '@/app/_shared/components/loading/loading.component';

export type EventStateType = {
  statusTicket: IEventStatusTicket;
};

@Component({
  selector: 'app-event-ticket-state',
  standalone: true,
  imports: [
    CommonModule,
    StateEventComponent,
    LoadingComponent,
    MatIconModule,
  ],
  templateUrl: './event-ticket-state.component.html',
  styles: ``
})
export class EventTicketStateComponent implements OnInit {
  public eventID!: string;

  public event: Partial<IEvent> = {};

  public eventStates: {
    isLoading: boolean;
    value: EventStateType;
    error: any[];
  } = {
    isLoading: true,
    value: {
      statusTicket: {
        global: [],
        actuel: [],
        filter: { time: '', value: [] },
      },
    },
    error: [],
  };

  constructor(
    private eventService: EventsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.eventID = this.route.snapshot.paramMap.get('eventID') ?? '0';

    this.initEventState();
  }

  initEventState() {
    this.eventService.getDetailStatusEvent(this.eventID).subscribe({
      next: (detail) => {
        this.event = { ...detail.event };

        this.eventStates = {
          isLoading: false,
          value: {
            statusTicket: detail.statusTicket,
          },
          error: [],
        };
      },
      error: (e) => {
        console.error(
          'Erreur lors du chargement des statistiques de l\'événement:',
          e
        );
        this.eventStates = {
          ...this.eventStates,
          isLoading: false,
          error: [{ error: e }],
        };
      },
    });
  }
}
