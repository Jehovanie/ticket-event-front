import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TitleCaseDateFrPipe } from '@/app/_shared/pipes/titleCaseDateFr';
import { FormsModule } from '@angular/forms';

import { IEvent } from '@/app/_core/model';

@Component({
  selector: 'app-list-event',
  imports: [
    CommonModule,
    RouterLink,
    TitleCaseDateFrPipe,
    MatPaginatorModule,
    MatTableModule,
    FormsModule,
  ],
  templateUrl: './list-event.component.html',
  styleUrl: './list-event.component.css',
})
export class ListEventComponent implements AfterViewInit {
  @Input() events!: IEvent[];

  displayedColumns: string[] = [
    'Numéro',
    'Evénement',
    'Date de debut',
    'Date de fin',
    'Lieu',
    'Place maximum',
    'Place libre',
    'Status',
    'Action'
  ];
  dataSource = new MatTableDataSource<IEvent>(this.events);

  // Pagination properties
  currentPage = 0;
  pageSize = 6;
  paginatedEvents: IEvent[] = [];

  // View mode
  viewMode: 'grid' | 'list' = 'grid';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource<IEvent>(this.events);
    this.updatePaginatedEvents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource<IEvent>(this.events);
    this.updatePaginatedEvents();
  }

  /**
   * Met à jour les événements paginés
   */
  updatePaginatedEvents(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.dataSource.data.slice(startIndex, endIndex);
  }

  /**
   * Navigation vers la page précédente
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedEvents();
    }
  }

  /**
   * Navigation vers la page suivante
   */
  nextPage(): void {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
      this.updatePaginatedEvents();
    }
  }

  /**
   * Navigation vers une page spécifique
   */
  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedEvents();
  }

  /**
   * Changement de la taille de page
   */
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.updatePaginatedEvents();
  }

  /**
   * Calcul du nombre total de pages
   */
  getTotalPages(): number {
    return Math.ceil(this.dataSource.data.length / this.pageSize);
  }

  /**
   * Obtient les numéros de pages à afficher
   */
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(0, this.currentPage - 2);
      const end = Math.min(totalPages, start + maxPagesToShow);
      
      for (let i = start; i < end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Obtient l'index de début pour l'affichage
   */
  getStartIndex(): number {
    return this.currentPage * this.pageSize + 1;
  }

  /**
   * Obtient l'index de fin pour l'affichage
   */
  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.dataSource.data.length);
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
   * Change le mode de vue
   */
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
}
