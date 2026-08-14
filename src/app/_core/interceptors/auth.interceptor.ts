import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/** Endpoints qui ne doivent jamais porter de jeton ni déclencher un renouvellement. */
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

const isPublic = (url: string): boolean =>
  PUBLIC_PATHS.some((path) => url.includes(path));

/**
 * Pose le `Authorization: Bearer` sur les requêtes API et gère l'expiration.
 *
 * Sur un 401, on tente **une** fois de renouveler le jeton puis on rejoue la
 * requête ; si le renouvellement échoue, la session est terminée proprement
 * plutôt que de laisser l'utilisateur face à des erreurs silencieuses.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  const withToken = (req: HttpRequest<unknown>, token: string | null) =>
    token && !isPublic(req.url)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(withToken(request, auth.token)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isPublic(request.url)) {
        return throwError(() => error);
      }

      if (!auth.refreshTokenValue) {
        auth.logout();
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap((token) => next(withToken(request, token))),
        catchError((refreshError) => {
          auth.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
