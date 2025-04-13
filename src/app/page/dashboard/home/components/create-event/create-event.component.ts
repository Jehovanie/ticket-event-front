import {
  Component,
  computed,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IEvent } from '../../../../../_core/model/event.interface';
import { CommonModule } from '@angular/common';
import { BtnLoadingComponent } from '../../../../../components/btn-loading/btn-loading.component';
import { EventsService } from '../../../../../_core/services/events/events.service';
import { ICategory } from '../../../../../_core/model/category.interface';
import { CategoryService } from '../../../../../_core/services/category/category.service';
import { IOrganizer } from '../../../../../_core/model/organizer.interface';
import { OrganizerService } from '../../../../../_core/services/organizer/organizer.service';

@Component({
  selector: 'app-create-event',
  imports: [CommonModule, FormsModule, BtnLoadingComponent],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css',
})
export class CreateEventComponent implements OnInit {
  event!: {
    title: WritableSignal<string>;
    description: WritableSignal<string>;
    startedAt: WritableSignal<Date>;
    endAt: WritableSignal<Date>;
    localisation: WritableSignal<string>;
    imageUrl: WritableSignal<string[]>;
    category: WritableSignal<string>;
    createdAt: WritableSignal<Date>;
    updatedAt: WritableSignal<Date>;
    organizer: WritableSignal<string>;
  };

  isValidEvent!: {
    title: Signal<boolean>;
    description: Signal<boolean>;
    category: Signal<boolean>;
  };

  isSubmitting: boolean = false;

  categories!: ICategory[];
  organizers!: IOrganizer[];

  constructor(
    private eventsService: EventsService,
    private categoryService: CategoryService,
    private organizerService: OrganizerService
  ) {}

  ngOnInit() {
    this.event = {
      title: signal<string>(''),
      description: signal<string>(''),
      startedAt: signal<Date>(new Date()),
      endAt: signal<Date>(new Date()),
      localisation: signal<string>(''),
      imageUrl: signal<string[]>([]),
      category: signal<string>(''),
      createdAt: signal<Date>(new Date()),
      updatedAt: signal<Date>(new Date()),
      organizer: signal<string>(''),
    };

    this.isValidEvent = {
      title: computed<boolean>(() => this.event.title().trim().length >= 3),
      description: computed(() => this.event.description().trim().length >= 3),
      category: computed(() => this.event.category().trim().length >= 3),
    };

    this.initAllData();
  }

  initAllData() {
    this.initCategories();
    this.initOrganizers();
  }

  async initCategories() {
    try {
      this.categoryService.getAllCategries().subscribe((categories) => {
        console.log('Categories:', categories);
        this.categories = categories;
      });
    } catch (e) {
      this.categories = [];
    }
  }

  async initOrganizers() {
    try {
      this.organizerService.getAllOrganizers().subscribe((organizer) => {
        console.log('Organizer:', organizer);
        this.organizers = organizer;
      });
    } catch (e) {
      this.categories = [];
    }
  }

  isFormValid = computed(() => {
    return (
      this.isValidEvent.title() &&
      this.isValidEvent.description() &&
      this.isValidEvent.category()
    );
  });

  openModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  createDataMapping(event: any): IEvent {
    let organizer =
      typeof event.organizer() === 'string'
        ? `/api/organizer/${event.organizer()}`
        : event.organizer();

    let category =
      typeof event.category() === 'string'
        ? `/api/category/${event.category()}`
        : event.category();

    return {
      title: event.title(),
      description: event.description(),
      startedAt: event.startedAt(),
      endAt: event.endAt(),
      localisation: event.localisation(),
      imageUrl: event.imageUrl(),
      category: category,
      createdAt: event.createdAt(),
      updatedAt: event.updatedAt(),
      organizer: organizer,
      status: 'pending',
    };
  }

  async onSubmit() {
    if (!this.isValidEvent) {
      alert('Please fill all the fields correctly.');
      return;
    }
    const newEvent: IEvent = this.createDataMapping(this.event);

    this.isSubmitting = true;

    console.log(newEvent);

    await this.handleCreateEvent(newEvent);
  }

  async handleCreateEvent(event: IEvent) {
    try {
      this.eventsService.createEvent(event).subscribe(() => {
        this.isSubmitting = false;
        this.resetInputFields();
        this.closeModal();
      });
    } catch (error) {
      console.error('Error creating event:', error);
      this.isSubmitting = false;
      alert('An error occurred while creating the event. Please try again.');
    }
  }

  resetInputFields() {
    this.event.title.set('');
    this.event.description.set('');
    this.event.startedAt.set(new Date());
    this.event.endAt.set(new Date());
    this.event.localisation.set('');
    this.event.imageUrl.set([]);
    this.event.category.set('');
    this.event.createdAt.set(new Date());
    this.event.updatedAt.set(new Date());
  }
}
