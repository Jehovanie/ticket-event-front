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
import { LocationService } from '../../../../../_core/services/location/location.service';
import { ILocation } from '../../../../../_core/model/location.interface';

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
    imageUrl: WritableSignal<string[]>;

    tickets: WritableSignal<
      { id: Signal<number>, name: Signal<string>; price: Signal<number>; size: Signal<number> }[]
    >;

    locationId: WritableSignal<number | null>;
    locationName: WritableSignal<string>;
    locationSize: WritableSignal<number | null>;

    categoryId: WritableSignal<number | null>;
    categoryName: WritableSignal<string>;
    categoryColor: WritableSignal<string>;

    organizerId: WritableSignal<number | null>;
    organizerName: WritableSignal<string>;
    organizerEmail: WritableSignal<string>;
    organizerPhone: WritableSignal<string>;
    organizerAddress: WritableSignal<string>;
    organizerWebsite: WritableSignal<string>;
  };

  isValidEvent!: {
    title: Signal<boolean>;
    description: Signal<boolean>;
  };

  isCreateNewLocation: boolean = false;
  isCreateNewOrganizer: boolean = false;
  isCreateNewCategory: boolean = false;
  isSubmitting: boolean = false;

  categories!: ICategory[];
  organizers!: IOrganizer[];
  locations!: ILocation[];

  constructor(
    private eventsService: EventsService,
    private categoryService: CategoryService,
    private organizerService: OrganizerService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.event = {
      title: signal<string>(''),
      description: signal<string>(''),
      startedAt: signal<Date>(new Date()),
      endAt: signal<Date>(new Date()),
      imageUrl: signal<string[]>([]),

      tickets: signal<
        {id: Signal<number>, name: Signal<string>; price: Signal<number>; size: Signal<number> }[]
      >([]),

      locationId: signal<number | null>(null),
      locationName: signal<string>(''),
      locationSize: signal<number | null>(null),

      categoryId: signal<number | null>(null),
      categoryName: signal<string>(''),
      categoryColor: signal<string>(''),

      organizerId: signal<number | null>(null),
      organizerName: signal<string>(''),
      organizerEmail: signal<string>(''),
      organizerPhone: signal<string>(''),
      organizerAddress: signal<string>(''),
      organizerWebsite: signal<string>(''),
    };

    this.isValidEvent = {
      title: computed<boolean>(() => this.event.title().trim().length >= 3),
      description: computed(() => this.event.description().trim().length >= 3),
    };

    this.initAllData();
  }

  initAllData() {
    this.initCategories();
    this.initOrganizers();
    this.initLocations();
  }

  updateTicketPrice(index: any, value: number) {
    const updated = this.event
      .tickets()
      .map((t, i) => (i === index ? { ...t, price: signal(value) } : t));

    this.event.tickets.set(updated);
  }

  updateTicketSize(index: any, value: number) {
    const updated = this.event
      .tickets()
      .map((t, i) => (i === index ? { ...t, size: signal(value) } : t));

    this.event.tickets.set(updated);
  }

  addTicket() {
    const newTicket = {
      id: signal<number>(Math.random()),
      name: signal<string>(''),
      price: signal<number>(0),
      size: signal<number>(0),
    };

    this.event.tickets.set([...this.event.tickets(), newTicket]);
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

  async initLocations() {
    try {
      this.locationService.getAllLocations().subscribe((locations) => {
        console.log('Location:', locations);
        this.locations = locations;
      });
    } catch (e) {
      this.locations = [];
    }
  }

  isFormValid = computed(() => {
    return this.isValidEvent.title() && this.isValidEvent.description();
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

  updateTicketName(index: any, value: string) {
    const updated = this.event
      .tickets()
      .map((t, i) => (i === index ? { ...t, name: signal(value) } : t));

    this.event.tickets.set(updated);
  }

  onSelectLocation(event: any) {
    console.log(event.target.value);
    const selectedLocation = this.locations.find(
      (location) => +location.id === +event.target.value
    );

    if (selectedLocation) {
      this.event.locationId.set(parseInt(selectedLocation.id));
      this.event.locationName.set(selectedLocation.name);
      this.event.locationSize.set(selectedLocation.size);
    }
  }

  createDataMapping(event: any): IEvent {
    const location = {
      id: event.locationId(),
      name: event.locationName(),
      size: event.locationSize(),
    };

    const category = {
      id: event.categoryId(),
      name: event.categoryName(),
      color: event.categoryColor(),
    };

    const organizer = {
      id: event.organizerId(),
      name: event.organizerName(),
      email: event.organizerEmail(),
      phone: event.organizerPhone(),
      address: event.organizerAddress(),
      website: event.organizerWebsite(),
    };

    return {
      title: event.title(),
      description: event.description(),
      startedAt: event.startedAt(),
      endAt: event.endAt(),
      imageUrl: event.imageUrl(),
      location: location,
      category: category,
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
    console.log(newEvent);

    this.isSubmitting = true;

    // console.log(newEvent);

    // await this.handleCreateEvent(newEvent);
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
    this.event.imageUrl.set([]);

    this.event.tickets.set([]);

    this.event.locationId.set(null);
    this.event.locationName.set('');
    this.event.locationSize.set(null);

    this.event.categoryId.set(null);
    this.event.categoryName.set('');
    this.event.categoryColor.set('');

    this.event.organizerId.set(null);
    this.event.organizerName.set('');
    this.event.organizerEmail.set('');
    this.event.organizerPhone.set('');
    this.event.organizerAddress.set('');
    this.event.organizerWebsite.set('');
  }
}
