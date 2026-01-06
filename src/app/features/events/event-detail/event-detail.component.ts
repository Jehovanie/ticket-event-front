import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IEvent } from '../../../_core/model/event.interface';
import { ICategory } from '../../../_core/model/category.interface';
import { ILocation } from '../../../_core/model/location.interface';
import { IOrganizer } from '../../../_core/model/organizer.interface';
import { ITicketType } from '../../../_core/model/ticket-type.interface';
import { EventsService } from '../../../_core/services/events/events.service';
import { LoadingComponent } from '../../../_shared/components/loading/loading.component';
import { EventDetailHeaderComponent } from './components/event-detail-header/event-detail-header.component';
import { EventDetailStatsComponent } from './components/event-detail-stats/event-detail-stats.component';
import { EventDetailInfoComponent } from './components/event-detail-info/event-detail-info.component';
import { EventDetailMetadataComponent } from './components/event-detail-metadata/event-detail-metadata.component';
import { EventDetailTicketTypesComponent } from './components/event-detail-ticket-types/event-detail-ticket-types.component';

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
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    LoadingComponent,
    EventDetailHeaderComponent,
    EventDetailStatsComponent,
    EventDetailInfoComponent,
    EventDetailMetadataComponent,
    EventDetailTicketTypesComponent
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  public eventID!: string;
  public event: IEvent | null = null;
  public isLoading = true;
  public isDeleting = false;
  public error: string | null = null;
  
  // État des statistiques
  public eventStats: EventStateType | null = null;
  public isLoadingStats = false;
  
  // Données typées
  public category: ICategory | null = null;
  public location: ILocation | null = null;
  public organizer: IOrganizer | null = null;
  public ticketTypes: ITicketType[] = [];
  
  // Gestion des images
  public currentImageIndex = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.eventID = params['eventID'];
        if (this.eventID) {
          this.loadEventDetails();
          this.loadEventStats();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les détails de l'événement
   */
  loadEventDetails(): void {
    this.isLoading = true;
    this.error = null;

    this.eventsService.get(`/events/${this.eventID}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: IEvent) => {
          this.event = event;
          this.processEventData(event);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'événement:', err);
          this.error = 'Impossible de charger les détails de l\'événement.';
          this.isLoading = false;
          this.showNotification('Erreur lors du chargement de l\'événement', 'error');
        }
      });
  }

  /**
   * Charge les statistiques de l'événement
   */
  loadEventStats(): void {
    this.isLoadingStats = true;
    
    this.eventsService.getDetailStatusEvent(this.eventID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: EventStateType) => {
          this.eventStats = stats;
          this.isLoadingStats = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des statistiques:', err);
          this.isLoadingStats = false;
        }
      });
  }

  /**
   * Traite les données de l'événement pour extraire les relations
   */
  private processEventData(event: IEvent): void {
    // Extraire la catégorie
    if (event.category && typeof event.category === 'object') {
      this.category = event.category as ICategory;
    }

    // Extraire la localisation
    if (event.location) {
      this.location = event.location;
    }

    // Extraire l'organisateur
    if (event.organizer && typeof event.organizer === 'object') {
      this.organizer = event.organizer as IOrganizer;
    }

    // Extraire les types de tickets
    if (event.ticket_type && Array.isArray(event.ticket_type)) {
      this.ticketTypes = event.ticket_type;
    }
  }

  /**
   * Navigation vers la page d'édition
   */
  editEvent(): void {
    this.router.navigate(['/events', this.eventID, 'edit']);
  }

  /**
   * Supprime l'événement
   */
  deleteEvent(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    this.isDeleting = true;

    this.eventsService.delete(`/events/${this.eventID}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification('Événement supprimé avec succès', 'success');
          this.router.navigate(['/events']);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.showNotification('Erreur lors de la suppression de l\'événement', 'error');
          this.isDeleting = false;
        }
      });
  }

  /**
   * Duplique l'événement
   */
  duplicateEvent(): void {
    if (!this.event) return;

    const duplicatedEvent: any = {
      ...this.event,
      title: `${this.event.title} (Copie)`,
    };

    // Supprimer les propriétés générées automatiquement
    delete duplicatedEvent.id;
    delete duplicatedEvent['@id'];
    delete duplicatedEvent['@type'];
    delete duplicatedEvent.createdAt;
    delete duplicatedEvent.updatedAt;

    this.eventsService.create('/events', duplicatedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newEvent: any) => {
          this.showNotification('Événement dupliqué avec succès', 'success');
          // Extraire l'ID de la réponse @id
          const id = newEvent['@id']?.split('/').pop() || newEvent.id;
          this.router.navigate(['/events', id]);
        },
        error: (err: any) => {
          console.error('Erreur lors de la duplication:', err);
          this.showNotification('Erreur lors de la duplication de l\'événement', 'error');
        }
      });
  }

  /**
   * Navigue vers les statistiques des tickets
   */
  viewTicketStats(): void {
    this.router.navigate(['/events', this.eventID, 'ticket-state']);
  }

  /**
   * Gère la navigation entre les images
   */
  previousImage(): void {
    if (this.event && this.event.imageUrl && this.event.imageUrl.length > 0) {
      this.currentImageIndex = 
        (this.currentImageIndex - 1 + this.event.imageUrl.length) % this.event.imageUrl.length;
    }
  }

  nextImage(): void {
    if (this.event && this.event.imageUrl && this.event.imageUrl.length > 0) {
      this.currentImageIndex = 
        (this.currentImageIndex + 1) % this.event.imageUrl.length;
    }
  }

  /**
   * Calcule le nombre total de tickets disponibles
   */
  getTotalTickets(): number {
    if (this.ticketTypes.length > 0) {
      return this.ticketTypes.reduce((sum, type) => sum + type.quantite_max, 0);
    }
    return 0;
  }

  /**
   * Calcule le revenu potentiel total
   */
  getTotalRevenue(): number {
    if (this.ticketTypes.length > 0) {
      return this.ticketTypes.reduce((sum, type) => sum + (type.prix * type.quantite_max), 0);
    }
    return 0;
  }

  /**
   * Obtient le nombre de types de tickets
   */
  getTicketTypesCount(): number {
    return this.ticketTypes.length;
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadEventDetails();
    this.loadEventStats();
  }

  /**
   * Affiche une notification
   */
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  /**
   * Retourne au listing
   */
  goBack(): void {
    this.router.navigate(['/events']);
  }
}
