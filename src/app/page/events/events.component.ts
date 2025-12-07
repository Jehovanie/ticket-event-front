import { Component, OnInit } from '@angular/core';

import { ListEventComponent } from './components/list-event/list-event.component';
import { FilterEventComponent } from './components/filter-event/filter-event.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { CommonModule } from '@angular/common';

import { EventsService } from '@/app/_core/services/events/events.service';
import { CategoryService } from '@/app/_core/services/category/category.service';
import { OrganizerService } from '@/app/_core/services/organizer/organizer.service';

import { ICategory, IEvent, IOrganizer } from '@/app/_core/model';
import { LoadingComponent } from '@/app/components/loading/loading.component';

type DataType<T> = {
  succes: boolean;
  items: T[];
  error: any[];
};

@Component({
  selector: 'app-events',
  imports: [
    ListEventComponent,
    FilterEventComponent,
    CreateEventComponent,
    LoadingComponent,
    CommonModule,
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  public data: {
    isLoading: boolean;
    events: DataType<IEvent>;
    category: DataType<ICategory>;
    organizer: DataType<IOrganizer>;
  } = {
    isLoading: true,
    events: {
      succes: false,
      items: [],
      error: [],
    },
    category: {
      succes: false,
      items: [],
      error: [],
    },
    organizer: {
      succes: false,
      items: [],
      error: [],
    },
  };

  constructor(
    private eventService: EventsService,
    private categoryService: CategoryService,
    private organizerService: OrganizerService
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.initEvents();
    // this.initCategories();
    // this.initOrganizers();
  }

  async initEvents() {
    try {
      this.eventService.getAllEvents().subscribe((data) => {
        this.data = {
          ...this.data,
          isLoading: false,
          events: {
            ...this.data.events,
            succes: true,
            items: data,
            error: [],
          },
        };
      });
    } catch (e) {
      this.data = {
        ...this.data,
        events: {
          ...this.data.events,
          succes: false,
          error: [
            {
              error: e,
            },
          ],
        },
      };
    }
  }

  async initCategories() {
    try {
      this.categoryService.getAllCategries().subscribe((data) => {
        this.data = {
          ...this.data,
          isLoading:
            this.data.events.succes &&
            this.data.category.succes &&
            this.data.organizer.succes,
          category: {
            ...this.data.category,
            succes: true,
            items: data,
            error: [],
          },
        };
      });
    } catch (e) {
      this.data = {
        ...this.data,
        category: {
          ...this.data.events,
          succes: false,
          error: [
            {
              error: e,
            },
          ],
        },
      };
    }
  }

  async initOrganizers() {
    try {
      this.organizerService.getAllOrganizers().subscribe((data) => {
        this.data = {
          ...this.data,
          isLoading:
            this.data.events.succes &&
            this.data.category.succes &&
            this.data.organizer.succes,
          category: {
            ...this.data.category,
            succes: true,
            items: data,
            error: [],
          },
        };
      });
    } catch (e) {
      this.data = {
        ...this.data,
        organizer: {
          ...this.data.events,
          succes: false,
          error: [
            {
              error: e,
            },
          ],
        },
      };
    }
  }
}
