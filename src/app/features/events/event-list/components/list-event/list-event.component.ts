import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, formatNumber } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TitleCaseDateFrPipe } from '@/app/_shared/pipes/titleCaseDateFr';
import { FormsModule } from '@angular/forms';

import { IEvent } from '@/app/_core/model';
import { DEFAULT_EVENTS_PER_PAGE } from '@/app/_core/services/events/events.service';

/**
 * Affichage d'une page d'événements.
 *
 * Composant purement présentationnel : il ne découpe rien lui-même, la page
 * courante lui est fournie par le parent qui interroge le serveur. Les clics
 * de pagination sont remontés via `pageChange` / `pageSizeChange`.
 */
@Component({
  selector: 'app-list-event',
  imports: [
    CommonModule,
    RouterLink,
    TitleCaseDateFrPipe,
    FormsModule,
  ],
  templateUrl: './list-event.component.html',
  styleUrl: './list-event.component.css',
})
export class ListEventComponent {
  /** Événements de la page courante, tels que renvoyés par le serveur. */
  @Input() events: IEvent[] = [];

  /** Nombre total d'événements côté serveur (toutes pages confondues). */
  @Input() itemsTotal = 0;

  /** Page courante, indexée à partir de 1 (convention de l'API). */
  @Input() currentPage = 1;

  @Input() pageSize = DEFAULT_EVENTS_PER_PAGE;

  /** Mode d'affichage piloté par la barre d'outils de la page. */
  @Input() viewMode: 'grid' | 'list' = 'grid';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  /**
   * Garde-fou : si l'API renvoie autre chose qu'un tableau, on affiche une
   * liste vide plutôt que de faire planter le rendu.
   */
  get displayedEvents(): IEvent[] {
    return Array.isArray(this.events) ? this.events : [];
  }

  /**
   * Demande une page au parent
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.getTotalPages() || page === this.currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  /**
   * Changement de la taille de page (relance une requête serveur)
   */
  onPageSizeChange(pageSize: number): void {
    this.pageSizeChange.emit(+pageSize);
  }

  /**
   * Calcul du nombre total de pages
   */
  getTotalPages(): number {
    if (this.pageSize <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.itemsTotal / this.pageSize));
  }

  /**
   * Obtient les numéros de pages à afficher (indexés à partir de 1)
   */
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const maxPagesToShow = 5;
    const pages: number[] = [];

    let start = 1;
    if (totalPages > maxPagesToShow) {
      start = Math.min(
        Math.max(1, this.currentPage - 2),
        totalPages - maxPagesToShow + 1
      );
    }
    const end = Math.min(totalPages, start + maxPagesToShow - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Obtient l'index de début pour l'affichage
   */
  getStartIndex(): number {
    if (this.itemsTotal === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  /**
   * Obtient l'index de fin pour l'affichage
   */
  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.itemsTotal);
  }

  /**
   * Vérifie si un événement est à venir
   */
  isEventUpcoming(event: IEvent): boolean {
    const now = new Date();
    const startDate = new Date(event.startedAt);
    return startDate > now;
  }

  /**
   * Vérifie si un événement est en cours
   */
  isEventOngoing(event: IEvent): boolean {
    const now = new Date();
    const startDate = new Date(event.startedAt);
    const endDate = new Date(event.endAt);
    return startDate <= now && endDate >= now;
  }

  /**
   * Vérifie si un événement est terminé
   */
  isEventPast(event: IEvent): boolean {
    const now = new Date();
    const endDate = new Date(event.endAt);
    return endDate < now;
  }

  /**
   * Obtient le statut de l'événement
   */
  getEventStatus(event: IEvent): string {
    if (this.isEventUpcoming(event)) return 'À venir';
    if (this.isEventOngoing(event)) return 'En cours';
    if (this.isEventPast(event)) return 'Terminé';
    return typeof event.status === 'string' ? event.status : 'Inconnu';
  }

  /**
   * Clé de statut : pilote la couleur de la pastille et du visuel de la carte,
   * pour que le statut se lise sans avoir à relire le texte.
   */
  getStatusKey(event: IEvent): 'upcoming' | 'ongoing' | 'past' {
    if (this.isEventOngoing(event)) return 'ongoing';
    if (this.isEventPast(event)) return 'past';
    return 'upcoming';
  }

  /** Nom de la catégorie, quand l'API la renvoie sous forme d'objet. */
  getCategoryName(event: IEvent): string | null {
    if (event.category && typeof event.category === 'object') {
      return event.category.name ?? null;
    }
    return null;
  }

  /** Prix d'entrée le plus bas, pour afficher un « à partir de ». */
  getMinPrice(event: IEvent): number | null {
    const prices = (event.ticket_type ?? [])
      .map((type) => type.prix)
      .filter((prix): prix is number => typeof prix === 'number');

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  hasPrice(event: IEvent): boolean {
    return this.getMinPrice(event) !== null;
  }

  /** Libellé au-dessus du prix. */
  getPriceCaption(event: IEvent): string {
    return this.hasPrice(event) ? 'À partir de' : 'Tarifs';
  }

  /**
   * Prix formaté en ariary. Un `0` reste un tarif valide (« Gratuit »), d'où le
   * passage par une méthode plutôt qu'un test de vérité dans le template.
   */
  getPriceLabel(event: IEvent): string {
    const minPrice = this.getMinPrice(event);

    if (minPrice === null) {
      return 'Non définis';
    }
    if (minPrice <= 0) {
      return 'Gratuit';
    }
    return `${formatNumber(minPrice, 'fr', '1.0-0')} Ar`;
  }

  /**
   * Capacité : somme des quotas de billets, à défaut la taille du lieu.
   */
  getCapacity(event: IEvent): number {
    const types = event.ticket_type ?? [];
    if (types.length > 0) {
      return types.reduce((total, type) => total + (type.quantite_max ?? 0), 0);
    }
    return event.location?.size ?? 0;
  }
}
