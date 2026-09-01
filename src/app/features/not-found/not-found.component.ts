import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

/**
 * Page affichée pour toute URL inconnue (route `**`).
 *
 * On préfère l'afficher plutôt que rediriger vers le tableau de bord : une
 * redirection silencieuse laisse croire à l'utilisateur qu'il s'est trompé de
 * clic alors qu'il s'agit souvent d'un lien obsolète ou d'une faute de frappe.
 * L'URL demandée est donc rappelée à l'écran, avec un retour explicite.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatIconModule],
  templateUrl: './not-found.component.html',
  styles: ``,
})
export class NotFoundComponent {
  private readonly location = inject(Location);

  /** URL demandée, figée à l'affichage — le routeur l'aura déjà quittée ensuite. */
  readonly requestedUrl = inject(Router).url;

  /** Raccourcis vers les sections réellement existantes de l'admin. */
  readonly suggestions = [
    {
      icon: 'dashboard',
      label: 'Tableau de bord',
      description: 'Vue d\'ensemble de votre activité',
      link: '/dashboard',
    },
    {
      icon: 'confirmation_number',
      label: 'Événements',
      description: 'Vos événements et leurs billets',
      link: '/events',
    },
    {
      icon: 'groups',
      label: 'Organisateurs',
      description: 'Les organisations dont vous faites partie',
      link: '/organizers',
    },
  ];

  goBack(): void {
    this.location.back();
  }
}
