import {
  ApplicationConfig,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './_core/interceptors/auth.interceptor';
import { serverErrorInterceptor } from './_core/interceptors/server-error.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { getFrenchPaginatorIntl } from './paginator-intl-fr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCharts(withDefaultRegisterables()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // `serverErrorInterceptor` est placé au plus près du réseau : il voit
    // l'échec en premier et bascule sur la page de panne, tandis que
    // `authInterceptor` garde la main sur les 401 et le renouvellement.
    provideHttpClient(withInterceptors([authInterceptor, serverErrorInterceptor])),
    { provide: MatPaginatorIntl, useValue: getFrenchPaginatorIntl() },
    { provide: LOCALE_ID, useValue: 'fr' },
  ],
};
