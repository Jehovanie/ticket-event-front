import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgStyle } from '@angular/common';
@Component({
  selector: 'app-navbar-link',
  imports: [RouterLink, RouterLinkActive, MatIconModule, NgStyle],
  template: `
    <a [routerLink]="objectLink.route" routerLinkActive="bg-gray-700" [ngStyle]="{ 'width': objectLink.isCollapsed ? '50px' : 'auto', 'height': objectLink.isCollapsed ? '50px' : 'auto' }" class="flex flex-col gap-1 items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-white transition-all duration-200" [class.aspect-square]="!objectLink.isCollapsed">
			<mat-icon class="text-2xl">{{ objectLink.icon }}</mat-icon>
			<span class="text-xs text-center leading-tight w-full" [class.hidden]="objectLink.isCollapsed">{{ objectLink.label }}</span>
		</a>
  `,
  styles: ``
})
export class NavbarLinkComponent {
   @Input() objectLink!: { label: string; icon: string; route: string, isCollapsed: boolean };

}
