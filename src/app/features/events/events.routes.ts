import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./events.component').then(m => m.EventsComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./event-list/event-list.component').then(m => m.EventListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./event-new/event-new.component').then(m => m.EventNewComponent)
      },
      {
        path: ':eventID',
        loadComponent: () => import('./event-detail/event-detail.component').then(m => m.EventDetailComponent)
      }
    ]
  }
];