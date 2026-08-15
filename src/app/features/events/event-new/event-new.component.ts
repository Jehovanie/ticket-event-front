import { ICategory, IEvent } from '@/app/_core/model';
import { ILocation } from '@/app/_core/model/location.interface';
import { IOrganizer } from '@/app/_core/model/organizer.interface';
import { CategoryService } from '@/app/_core/services/category/category.service';
import { EventsService } from '@/app/_core/services/events/events.service';
import { LocationService } from '@/app/_core/services/location/location.service';
import { OrganizerService } from '@/app/_core/services/organizer/organizer.service';
import { BtnLoadingComponent } from '@/app/_shared/components/btn-loading/btn-loading.component';
import {
  SearchSelectComponent,
  SearchSelectOption,
} from '@/app/_shared/components/search-select/search-select.component';
import { AriaryPipe } from '@/app/_shared/pipes/ariary.pipe';
import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '@/app/_shared/services/notification.service';
import { Router, RouterLink } from '@angular/router';

/** Ligne de tarif en cours de saisie. */
type TicketDraft = {
  id: number;
  name: WritableSignal<string>;
  price: WritableSignal<number>;
  size: WritableSignal<number>;
};

/** Une entrée de la liste de complétion affichée dans le récapitulatif. */
type ChecklistItem = {
  label: string;
  done: boolean;
};

@Component({
  selector: 'app-event-new',
  imports: [
    CommonModule,
    FormsModule,
    BtnLoadingComponent,
    SearchSelectComponent,
    RouterLink,
    MatIconModule,
    AriaryPipe,
  ],
  templateUrl: './event-new.component.html',
  host: {
    class: 'block h-full'
  },
  styles: ``
})
export class EventNewComponent implements OnInit {
  event!: {
    title: WritableSignal<string>;
    description: WritableSignal<string>;
    /** Format `yyyy-MM-ddTHH:mm` (valeur brute d'un input datetime-local). */
    startedAt: WritableSignal<string>;
    endAt: WritableSignal<string>;
    imageUrl: WritableSignal<string[]>;

    locationId: WritableSignal<number | null>;
    locationName: WritableSignal<string | null>;
    locationSize: WritableSignal<number | null>;

    categoryId: WritableSignal<number | null>;
    categoryName: WritableSignal<string | null>;
    categoryColor: WritableSignal<string | null>;

    /**
     * Seul l'identifiant est retenu : l'organisateur se choisit parmi les
     * existants, il ne se crée plus depuis ce formulaire (page dédiée à venir).
     */
    organizerId: WritableSignal<number | null>;

    tickets: WritableSignal<TicketDraft[]>;
  };

  /** Validité champ par champ : pilote les messages d'erreur du formulaire. */
  isValidEvent!: {
    title: Signal<boolean>;
    description: Signal<boolean>;
    startedAt: Signal<boolean>;
    endAt: Signal<boolean>;
    location: Signal<boolean>;
    category: Signal<boolean>;
    organizer: Signal<boolean>;
    tickets: Signal<boolean>;
  };

  isCreateNewLocation = false;
  isCreateNewCategory = false;

  /** Passe à `true` à la première tentative d'envoi : on n'accuse pas l'utilisateur avant. */
  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly categories = signal<ICategory[]>([]);
  readonly organizers = signal<IOrganizer[]>([]);
  readonly locations = signal<ILocation[]>([]);

  /**
   * Options des listes déroulantes avec recherche. Le second champ (`hint`) est
   * ce qui permet de trancher entre deux entrées au nom proche : la capacité
   * pour un lieu, l'email pour un organisateur.
   */
  readonly locationOptions = computed<SearchSelectOption[]>(() =>
    this.locations().map((location) => ({
      value: location.id,
      label: location.name,
      hint: `${location.size} places`,
    }))
  );

  readonly categoryOptions = computed<SearchSelectOption[]>(() =>
    this.categories().map((category) => ({
      value: category.id ?? '',
      label: category.name ?? 'Sans nom',
      color: category.color || '#9ca3af',
    }))
  );

  readonly organizerOptions = computed<SearchSelectOption[]>(() =>
    this.organizers().map((organizer) => ({
      value: organizer.id ?? '',
      label: organizer.name ?? 'Sans nom',
      hint: organizer.email ?? undefined,
    }))
  );

  /** Identifiant local des lignes de tarif (jamais un aléatoire : risque de collision). */
  private nextTicketId = 1;

  constructor(
    private eventsService: EventsService,
    private categoryService: CategoryService,
    private organizerService: OrganizerService,
    private locationService: LocationService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.event = {
      title: signal<string>(''),
      description: signal<string>(''),
      startedAt: signal<string>(''),
      endAt: signal<string>(''),
      imageUrl: signal<string[]>([]),

      tickets: signal<TicketDraft[]>([]),

      locationId: signal<number | null>(null),
      locationName: signal<string | null>(null),
      locationSize: signal<number | null>(null),

      categoryId: signal<number | null>(null),
      categoryName: signal<string | null>(null),
      categoryColor: signal<string | null>('#3ab7bf'),

      organizerId: signal<number | null>(null),
    };

    this.isValidEvent = {
      title: computed<boolean>(() => this.event.title().trim().length >= 3),
      description: computed(() => this.event.description().trim().length >= 3),
      startedAt: computed(() => this.event.startedAt().length > 0),
      endAt: computed(() => {
        const start = this.event.startedAt();
        const end = this.event.endAt();
        if (end.length === 0) {
          return false;
        }
        return start.length === 0 || new Date(end) > new Date(start);
      }),
      location: computed(() =>
        this.isCreateNewLocation
          ? (this.event.locationName() ?? '').trim().length > 0 &&
            (this.event.locationSize() ?? 0) > 0
          : this.event.locationId() !== null
      ),
      category: computed(() =>
        this.isCreateNewCategory
          ? (this.event.categoryName() ?? '').trim().length > 0
          : this.event.categoryId() !== null
      ),
      organizer: computed(() => this.event.organizerId() !== null),
      tickets: computed(() => {
        const tickets = this.event.tickets();
        return (
          tickets.length > 0 &&
          tickets.every(
            (ticket) => ticket.name().trim().length > 0 && ticket.size() > 0
          )
        );
      }),
    };

    this.initAllData();
    this.addTicket();
  }

  initAllData() {
    this.initCategories();
    this.initOrganizers();
    this.initLocations();
  }

  // ---------------------------------------------------------------- Tarifs

  addTicket() {
    const newTicket: TicketDraft = {
      id: this.nextTicketId++,
      name: signal<string>(''),
      price: signal<number>(0),
      size: signal<number>(0),
    };

    this.event.tickets.set([...this.event.tickets(), newTicket]);
  }

  removeTicket(ticketId: number) {
    this.event.tickets.set(
      this.event.tickets().filter((ticket) => ticket.id !== ticketId)
    );
  }

  /** Capacité cumulée des tarifs saisis. */
  readonly totalCapacity = computed(() =>
    this.event.tickets().reduce((total, ticket) => total + (ticket.size() || 0), 0)
  );

  /** Recette maximale si tout est vendu. */
  readonly totalRevenue = computed(() =>
    this.event
      .tickets()
      .reduce((total, ticket) => total + (ticket.price() || 0) * (ticket.size() || 0), 0)
  );

  /**
   * Prix d'entrée le plus bas, calculé sur les seuls tarifs réellement commencés :
   * une ligne vierge à 0 afficherait « Gratuit » alors que rien n'est saisi.
   */
  readonly minPrice = computed<number | null>(() => {
    const prices = this.event
      .tickets()
      .filter((ticket) => ticket.name().trim().length > 0 || ticket.size() > 0)
      .map((ticket) => ticket.price() || 0);

    return prices.length > 0 ? Math.min(...prices) : null;
  });

  /** Capacité du lieu retenu, qu'il soit existant ou en cours de création. */
  readonly venueCapacity = computed<number | null>(() => {
    if (this.isCreateNewLocation) {
      return this.event.locationSize();
    }
    const selected = this.locations().find(
      (location) => +location.id === this.event.locationId()
    );
    return selected?.size ?? null;
  });

  /** Vendre plus de places que le lieu n'en contient : à signaler, sans bloquer. */
  readonly isOverCapacity = computed(() => {
    const capacity = this.venueCapacity();
    return capacity !== null && capacity > 0 && this.totalCapacity() > capacity;
  });

  // ------------------------------------------------------------- Sélections

  /**
   * Recopie le lieu choisi dans le brouillon. Sans ça, le payload partait avec
   * `name: null` et `size: NaN`.
   */
  onSelectLocation(value: string) {
    const locationId = value ? +value : null;
    this.event.locationId.set(locationId);

    const selected = this.locations().find((location) => +location.id === locationId);
    this.event.locationName.set(selected?.name ?? null);
    this.event.locationSize.set(selected?.size ?? null);
  }

  onSelectCategory(value: string) {
    const categoryId = value ? +value : null;
    this.event.categoryId.set(categoryId);

    const selected = this.categories().find((category) => +(category.id ?? 0) === categoryId);
    this.event.categoryName.set(selected?.name ?? null);
    this.event.categoryColor.set(selected?.color ?? '#3ab7bf');
  }

  onSelectOrganizer(value: string) {
    this.event.organizerId.set(value ? +value : null);
  }

  /** Bascule « choisir » / « créer » en repartant d'un état propre. */
  toggleCreateLocation() {
    this.isCreateNewLocation = !this.isCreateNewLocation;
    this.event.locationId.set(null);
    this.event.locationName.set(null);
    this.event.locationSize.set(null);
  }

  toggleCreateCategory() {
    this.isCreateNewCategory = !this.isCreateNewCategory;
    this.event.categoryId.set(null);
    this.event.categoryName.set(null);
    this.event.categoryColor.set('#3ab7bf');
  }

  setImageUrl(url: string) {
    const trimmed = url.trim();
    this.event.imageUrl.set(trimmed.length > 0 ? [trimmed] : []);
  }

  // ------------------------------------------------------------- Validation

  /** Durée entre début et fin, affichée sous les champs de date. */
  readonly durationLabel = computed<string | null>(() => {
    const start = this.event.startedAt();
    const end = this.event.endAt();
    if (!start || !end) {
      return null;
    }

    const milliseconds = new Date(end).getTime() - new Date(start).getTime();
    if (milliseconds <= 0) {
      return null;
    }

    const minutes = Math.round(milliseconds / 60000);
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const rest = minutes % 60;
      return rest > 0 ? `${hours} h ${rest}` : `${hours} h`;
    }

    const days = Math.round(hours / 24);
    if (days < 31) return `${days} jour${days > 1 ? 's' : ''}`;

    return `${Math.round(days / 30)} mois`;
  });

  /** Liste de complétion : dit ce qu'il reste à faire, pas seulement que c'est faux. */
  readonly checklist = computed<ChecklistItem[]>(() => [
    { label: 'Titre et description', done: this.isValidEvent.title() && this.isValidEvent.description() },
    { label: 'Dates de début et de fin', done: this.isValidEvent.startedAt() && this.isValidEvent.endAt() },
    { label: 'Lieu', done: this.isValidEvent.location() },
    { label: 'Catégorie', done: this.isValidEvent.category() },
    { label: 'Organisateur', done: this.isValidEvent.organizer() },
    { label: 'Au moins un tarif', done: this.isValidEvent.tickets() },
  ]);

  readonly remainingSteps = computed(
    () => this.checklist().filter((item) => !item.done).length
  );

  readonly isFormValid = computed(() =>
    this.checklist().every((item) => item.done)
  );

  // --------------------------------------------------------------- Chargement

  initCategories() {
    this.categoryService.getAllCategries().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }

  initOrganizers() {
    this.organizerService.getMyOrganizers().subscribe({
      next: (organizers) => this.organizers.set(organizers),
      error: () => this.organizers.set([]),
    });
  }

  initLocations() {
    this.locationService.getAllLocations().subscribe({
      next: (locations) => this.locations.set(locations),
      error: () => this.locations.set([]),
    });
  }

  // ----------------------------------------------------------------- Envoi

  createDataMapping(): IEvent {
    const location = {
      id: this.event.locationId(),
      name: this.event.locationName(),
      size: Number(this.event.locationSize() ?? 0),
    };

    const category = {
      id: this.event.categoryId(),
      name: this.event.categoryName(),
      color: this.event.categoryColor() || '',
    };

    // `EventInputDenormalizer::getOrganizer()` recharge l'entité dès que `id` est
    // présent et ignore le reste : envoyer nom, email… serait sans effet.
    const organizer = { id: this.event.organizerId() };

    const tickets = this.event.tickets().map((ticket) => ({
      name: ticket.name(),
      prix: Number(ticket.price() || 0),
      quantite_max: Number(ticket.size() || 0),
    }));

    return {
      title: this.event.title().trim(),
      description: this.event.description().trim(),
      // L'input renvoie `yyyy-MM-ddTHH:mm` : on repasse en ISO pour l'API.
      startedAt: new Date(this.event.startedAt()),
      endAt: new Date(this.event.endAt()),
      // Ignoré par `EventInputDenormalizer` aujourd'hui ; conservé pour le jour
      // où l'API lira le champ (l'entité possède déjà la colonne).
      imageUrl: this.event.imageUrl(),
      // `status` n'est pas lu non plus : le constructeur de l'entité le fixe à false.
      location,
      category,
      organizer,
      ticket_type : tickets,
    } as unknown as IEvent;
  }


  

  onSubmit() {
    this.submitted.set(true);
    this.submitError.set(null);

    if (!this.isFormValid()) {
      this.notification.error(
        'Certains champs obligatoires sont incomplets.',
        'Formulaire incomplet'
      );
      return;
    }

    this.isSubmitting.set(true);

    this.eventsService.createEvent(this.createDataMapping()).subscribe({
      next: (createdEvent) => {
        this.isSubmitting.set(false);

        // La réponse peut être vide ou sans `title` : on retombe sur la saisie.
        const createdTitle = createdEvent?.title || this.event.title();
        this.notification.success(
          `« ${createdTitle} » est enregistré.`,
          'Événement créé'
        );

        // On amène l'utilisateur sur ce qu'il vient de créer, si l'API a renvoyé son id.
        const createdId = createdEvent?.id;
        this.router.navigate(createdId ? ['/events', createdId] : ['/events']);
      },
      error: (error) => {
        console.error("Erreur lors de la création de l'événement:", error);
        this.isSubmitting.set(false);
        this.submitError.set(
          "La création a échoué. Vérifiez les informations puis réessayez."
        );
      },
    });
  }
}
