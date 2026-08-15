import { Routes } from '@angular/router';

export const ORGANIZERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./organizers.component').then((m) => m.OrganizersComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./organizer-list/organizer-list.component').then(
            (m) => m.OrganizerListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./organizer-new/organizer-new.component').then(
            (m) => m.OrganizerNewComponent
          ),
      },
    ],
  },
];
