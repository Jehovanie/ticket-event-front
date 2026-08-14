import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  INavLink,
  NavbarLinkComponent,
} from '../navbar-link/navbar-link.component';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-asidebar',
  imports: [CommonModule, NavbarLinkComponent, RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './asidebar.component.html',
  styleUrl: './asidebar.component.css',
})
export class AsidebarComponent {
  userEmail = 'user@example.com';
  userName = 'John Doe';

  @Input() isCollapsed: boolean = false;

  @Output() isCollapsedChange = new EventEmitter<boolean>();

  /**
   * Menu groupé par domaine : onze entrées à plat sont difficiles à balayer,
   * les sections donnent des points de repère stables.
   */
  readonly navSections: { title: string; links: INavLink[] }[] = [
    {
      title: 'Pilotage',
      links: [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Événements', icon: 'event', route: '/events' },
      ],
    },
    {
      title: 'Gestion',
      links: [
        { label: 'Organisateurs', icon: 'groups', route: '/organizers' },
        { label: 'Utilisateurs', icon: 'person', route: '/users' },
        { label: 'Tickets & ventes', icon: 'confirmation_number', route: '/tickets' },
        { label: 'Paiements', icon: 'payments', route: '/payments' },
      ],
    },
    {
      title: 'Plateforme',
      links: [
        { label: 'Support & modération', icon: 'support_agent', route: '/support' },
        { label: 'Notifications', icon: 'notifications', route: '/notifications' },
        { label: 'Contenus', icon: 'article', route: '/content' },
        { label: 'Sécurité & rôles', icon: 'security', route: '/security' },
        { label: 'Paramètres système', icon: 'settings', route: '/system-settings' },
      ],
    },
  ];

  /** Initiales affichées dans l'avatar, y compris en mode replié. */
  get userInitials(): string {
    return this.userName
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }
}
