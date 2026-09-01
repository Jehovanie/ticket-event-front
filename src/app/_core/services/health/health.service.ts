import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { AppService } from '../AppService';
import { environment } from '@/app/environements/environement';

/** Chemin de la sonde, exporté pour que l'intercepteur s'exclue de sa propre redirection. */
export const HEALTH_PATH = '/health';

/** Résultat d'une vérification de disponibilité de l'API. */
export interface IHealthStatus {
  isUp: boolean;
  /** Code HTTP observé — `0` quand l'API n'a même pas répondu (réseau, CORS, serveur arrêté). */
  status: number;
}

/**
 * Sonde de disponibilité de l'API (`GET /health`).
 *
 * La seule information qui compte est « le serveur répond-il ? » : le corps de
 * la réponse n'est pas interprété, et une erreur n'est jamais propagée — elle
 * est convertie en `isUp: false` pour que la page d'erreur puisse boucler sur
 * cette vérification sans avoir à gérer un flux en échec.
 */
@Injectable({ providedIn: 'root' })
export class HealthService extends AppService {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  check(): Observable<IHealthStatus> {
    return this.get<unknown>(HEALTH_PATH).pipe(
      map(() => ({ isUp: true, status: 200 })),
      catchError((error: { status?: number }) =>
        of({ isUp: false, status: error.status ?? 0 })
      )
    );
  }
}
