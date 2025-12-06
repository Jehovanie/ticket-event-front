import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsidebarComponent } from './components/asidebar/asidebar.component';
import { NgClass } from "@angular/common";
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AsidebarComponent,
    NgClass
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'review';
  sidebarWidth = 'auto';

  isCollapsed = false;

  onSidebarCollapsedChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}