import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-asidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './asidebar.component.html',
  styleUrl: './asidebar.component.css',
})
export class AsidebarComponent {}
