import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from "@angular/common";
import { AsidebarComponent } from '@/app/_shared/components/asidebar/asidebar.component';
@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    AsidebarComponent,
    NgClass
],
  templateUrl: './main-layout.component.html',
  styles: ``
})
export class MainLayoutComponent {
  title = 'review';
  sidebarWidth = 'auto';

  isCollapsed = false;

  onSidebarCollapsedChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}