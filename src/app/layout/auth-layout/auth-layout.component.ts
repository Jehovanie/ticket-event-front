import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatIconModule],
  templateUrl: './auth-layout.component.html',
  host: {
    class: 'block h-full'
  },
  styles: ``
})
export class AuthLayoutComponent {
  /** Arguments affichés sur le panneau de marque, côté gauche. */
  readonly highlights = [
    {
      icon: 'event',
      title: 'Vos événements en un coup d’œil',
      text: 'Programmation, jauges et statuts réunis sur une seule page.',
    },
    {
      icon: 'confirmation_number',
      title: 'Billetterie maîtrisée',
      text: 'Tarifs, quotas et recette potentielle calculés en direct.',
    },
    {
      icon: 'insights',
      title: 'Ventes suivies au jour le jour',
      text: 'Statistiques par événement et par type de billet.',
    },
  ];
}
