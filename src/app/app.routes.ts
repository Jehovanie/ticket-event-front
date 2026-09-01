import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { authGuard, guestGuard } from './_core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    // Panne d'API : hors layout et hors `authGuard`, puisque la vérification de
    // session passe elle aussi par l'API et échouerait tout autant.
    path: 'server-error',
    loadComponent: () => import('./features/server-error/server-error.component').then(m => m.ServerErrorComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'events',
        loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES)
      },
      {
        path: 'organizers',
        loadChildren: () => import('./features/organizers/organizers.routes').then(m => m.ORGANIZERS_ROUTES)
      },
      {
        // URL inconnue d'un utilisateur connecté : on garde la barre latérale
        // pour qu'il reste dans l'application au lieu d'être renvoyé ailleurs.
        path: '**',
        loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
      }
    ]
  },
  {
    // Filet de sécurité hors layout principal (accès non authentifié).
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
