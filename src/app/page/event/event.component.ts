import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsService } from '@/app/_core/services/events/events.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IEvent } from '@/app/_core/model';
import { LoadingComponent } from '@/app/components/loading/loading.component';
import { StateEventComponent } from './components/state-event/state-event.component';

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
    StateEventComponent,
    LoadingComponent,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent implements OnInit {
  public eventID!: number;

  public event: Partial<IEvent> = { id: '1', title: "test", description: "totot" };

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
    const eventId = this.route.snapshot.paramMap.get('eventID') ?? '0';

    this.eventID = parseInt(eventId);

    this.initEventState();
  }

  initEventState() {
    try {
      this.eventService.getDetailStatusEvent(this.eventID).subscribe((data) => {
        const { events } = data;
        const { event, statusTicket } = events;
        this.event = { ...event };
        
        this.eventStates = {
          isLoading: false,
          value: {
            statusTicket: statusTicket,
          },
          error: [],
        };
      });
    } catch (e) {
      console.log(e);
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
}
