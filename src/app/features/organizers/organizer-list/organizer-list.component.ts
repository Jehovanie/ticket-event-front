import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { IMyOrganizer } from '@/app/_core/model';
import { OrganizerService } from '@/app/_core/services/organizer/organizer.service';
import { LoadingComponent } from '@/app/_shared/components/loading/loading.component';

/** Habillage d'un rôle : le libellé vient de l'API, la couleur est locale. */
type RoleTone = { classes: string; icon: string };

@Component({
  selector: 'app-organizer-list',
  imports: [CommonModule, RouterLink, MatIconModule, LoadingComponent],
  templateUrl: './organizer-list.component.html',
  styles: ``,
})
export class OrganizerListComponent implements OnInit {
  public data: {
    isLoading: boolean;
    organizers: IMyOrganizer[];
    /**
     * Le fondateur n'appartient à aucune organisation : sa liste vide n'est pas
     * la même chose que celle d'un compte sans rattachement, et l'écran d'état
     * vide doit le dire.
     */
    isSuperAdmin: boolean;
    error: string | null;
  } = {
    isLoading: true,
    organizers: [],
    isSuperAdmin: false,
    error: null,
  };

  constructor(private organizerService: OrganizerService) {}

  ngOnInit(): void {
    this.loadOrganizers();
  }

  loadOrganizers(): void {
    this.data = { ...this.data, isLoading: true, error: null };

    this.organizerService.getMyOrganizations().subscribe({
      next: (result) => {
        this.data = {
          isLoading: false,
          organizers: Array.isArray(result.items) ? result.items : [],
          isSuperAdmin: result.isSuperAdmin,
          error: null,
        };
      },
      error: (e) => {
        console.error('Erreur lors du chargement des organisateurs:', e);
        this.data = {
          isLoading: false,
          organizers: [],
          isSuperAdmin: false,
          error: 'Impossible de charger vos organisations.',
        };
      },
    });
  }

  /**
   * Encodage fixe des rôles, réutilisable ailleurs : responsable = primary
   * (le plus engageant), administrateur = secondary, membre = neutre.
   */
  roleTone(role: string | undefined): RoleTone {
    switch (role) {
      case 'owner':
        return {
          classes: 'bg-primary-50 text-primary-700 ring-primary-100',
          icon: 'workspace_premium',
        };
      case 'admin':
        return {
          classes: 'bg-secondary-50 text-secondary-700 ring-secondary-100',
          icon: 'shield',
        };
      default:
        return {
          classes: 'bg-gray-100 text-gray-600 ring-gray-200',
          icon: 'person',
        };
    }
  }

  /** Initiales de l'organisation, faute de logo côté API. */
  initials(name: string | undefined): string {
    return (name ?? '?')
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}
