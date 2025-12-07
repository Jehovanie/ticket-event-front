import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarLinkComponent } from '../navbar-link/navbar-link.component';
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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }
}
