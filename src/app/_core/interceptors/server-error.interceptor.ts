import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { HEALTH_PATH } from '../services/health/health.service';

/** Route de la page « API indisponible ». */
export const SERVER_ERROR_ROUTE = '/server-error';

/**
 * Bascule vers la page d'erreur serveur quand l'API ne répond plus.
 *
 * Deux cas seulement déclenchent la redirection, pour ne pas voler l'écran à
 * l'utilisateur sur un incident isolé :
 *
 * - `status === 0` : l'API n'a pas répondu du tout (serveur arrêté, réseau,
 *   CORS). Plus rien ne fonctionnera, autant le dire tout de suite.
 * - `5xx` sur une lecture (`GET`) : la page demandée ne peut pas s'afficher.
 *
 * Un `5xx` sur un `POST`/`PUT`/`DELETE` est en revanche propagé tel quel : le
 * formulaire garde sa saisie et affiche son propre message, alors qu'une
 * redirection ferait perdre le travail en cours.
 *
 * La sonde `/health` est exclue, sans quoi la page d'erreur — qui l'interroge
 * en boucle — se redirigerait vers elle-même.
 */
export const serverErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnreachable = error.status === 0;
      const isServerFailure = error.status >= 500 && request.method === 'GET';
      const isProbe = request.url.includes(HEALTH_PATH);

      if (!isProbe && (isUnreachable || isServerFailure)) {
        // `returnUrl` permet de reprendre là où l'utilisateur en était une fois
        // l'API revenue ; on ne le pose pas si on y est déjà.
        const current = router.url;

        if (!current.startsWith(SERVER_ERROR_ROUTE)) {
          router.navigate([SERVER_ERROR_ROUTE], {
            queryParams: {
              status: error.status,
              returnUrl: current !== '/' ? current : null,
            },
          });
        }
      }

      return throwError(() => error);
    })
  );
};
