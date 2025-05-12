import { Component, OnInit } from '@angular/core';
import { StateEventComponent } from './components/state-event/state-event.component';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../../_core/services/events/events.service';
import { LoadingComponent } from '../../../components/loading/loading.component';

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
  imports: [CommonModule, StateEventComponent, LoadingComponent],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent implements OnInit {
  eventStates: {
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

  constructor(private eventService: EventsService) {}

  ngOnInit(): void {
    this.initEventState();
  }

  initEventState() {
    const eventId = 21;
    try {
      this.eventService.getDetailStatusEvent(eventId).subscribe((data) => {
        const { statusTicket } = data;
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
