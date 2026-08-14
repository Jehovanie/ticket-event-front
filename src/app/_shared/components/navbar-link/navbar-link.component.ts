import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

export interface INavLink {
  label: string;
  icon: string;
  route: string;
}

/**
 * Entrée de menu de la barre latérale.
 *
 * Une seule ligne cliquable : icône + libellé, avec un liseré d'accent à gauche
 * quand la route est active. En mode replié, le libellé cède la place à une
 * infobulle pour que le menu reste utilisable en rail d'icônes.
 */
@Component({
  selector: 'app-navbar-link',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  template: `
    <a
      [routerLink]="link.route"
      routerLinkActive
      #routeState="routerLinkActive"
      [attr.aria-current]="routeState.isActive ? 'page' : null"
      [matTooltip]="link.label"
      [matTooltipDisabled]="!isCollapsed"
      matTooltipPosition="right"
      class="group relative flex items-center h-11 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      [ngClass]="[
        isCollapsed ? 'justify-center px-0' : 'gap-3 px-3',
        routeState.isActive
          ? 'bg-white/10 text-white'
          : 'text-primary-200 hover:bg-white/5 hover:text-white'
      ]"
    >
      <span
        *ngIf="routeState.isActive"
        class="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-secondary-500"
      ></span>

      <mat-icon
        class="!w-5 !h-5 !text-xl flex-shrink-0 transition-colors"
        [ngClass]="routeState.isActive ? 'text-secondary-500' : 'text-primary-300 group-hover:text-white'"
      >{{ link.icon }}</mat-icon>

      <span *ngIf="!isCollapsed" class="truncate">{{ link.label }}</span>
    </a>
  `,
  host: {
    class: 'block'
  },
  styles: ``
})
export class NavbarLinkComponent {
  @Input({ required: true }) link!: INavLink;
  @Input() isCollapsed = false;
}
