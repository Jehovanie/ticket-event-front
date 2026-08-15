import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  finalize,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environements/environement';
import {
  IAuthTokens,
  ILoginPayload,
  IRegisterPayload,
  IRegisterResponse,
  IUser,
} from '../../model';
import { AppService } from '../AppService';

const TOKEN_KEY = 'ticketup.admin.token';
const REFRESH_TOKEN_KEY = 'ticketup.admin.refresh_token';
const USER_KEY = 'ticketup.admin.user';

/** Rôle global côté API (`User::ROLE_SUPER_ADMIN`). */
export const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';

/**
 * Authentification par JWT.
 *
 * Le jeton d'accès est de courte durée ; le refresh token (30 jours, créé par
 * `JwtLoginSuccessSubscriber` côté API) permet de le renouveler sans redemander
 * le mot de passe. « Se souvenir de moi » choisit simplement le support de
 * stockage : `localStorage` survit à la fermeture du navigateur, `sessionStorage`
 * non.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService extends AppService {
  /** Utilisateur courant, lu au démarrage depuis le stockage. */
  readonly currentUser = signal<IUser | null>(this.readStoredUser());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /**
   * Rôle global du fondateur : il ouvre tous les droits mais ne crée **aucune
   * appartenance à une organisation**. Les endpoints en `/me` (`/events/me`,
   * `/user/me/organizations`) répondent donc vide pour lui — c'est ce drapeau
   * qui permet de basculer sur les listes complètes.
   */
  readonly isSuperAdmin = computed(() =>
    (this.currentUser()?.roles ?? []).includes(ROLE_SUPER_ADMIN)
  );

  /** Renouvellement en cours, partagé pour ne pas le déclencher en parallèle. */
  private refreshInFlight$: Observable<string> | null = null;

  constructor(httpClient: HttpClient, private router: Router) {
    super(httpClient, environment.apiUrl);
  }

  get token(): string | null {
    return this.storage()?.getItem(TOKEN_KEY) ?? null;
  }

  get refreshTokenValue(): string | null {
    return this.storage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  login(payload: ILoginPayload, remember = true): Observable<IUser> {
    return this.post<IAuthTokens>('/auth/login', payload).pipe(
      tap((tokens) => this.storeTokens(tokens, remember)),
      // Le login ne renvoie que des jetons : on enchaîne sur le profil pour que
      // l'état soit complet dès le retour de l'appel.
      switchMap(() => this.me())
    );
  }

  register(payload: IRegisterPayload, remember = true): Observable<IUser> {
    return this.post<IRegisterResponse>('/auth/register', payload).pipe(
      tap((response) => {
        this.storeTokens(response, remember);
        this.storeUser(response.user, remember);
      }),
      map((response) => response.user)
    );
  }

  /** Profil de l'utilisateur connecté (le jeton est posé par l'intercepteur). */
  me(): Observable<IUser> {
    return this.get<IUser>('/user/me').pipe(
      tap((user) => this.storeUser(user, this.isPersistent()))
    );
  }

  /**
   * Renouvelle le jeton d'accès. Les appels concurrents partagent la même
   * requête : sans ça, plusieurs 401 simultanés déclencheraient autant de
   * rafraîchissements, et tous sauf un seraient invalidés.
   */
  refreshToken(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.refreshTokenValue;
    if (!refreshToken) {
      return throwError(() => new Error('Aucun refresh token disponible'));
    }

    this.refreshInFlight$ = this.post<IAuthTokens>('/auth/refresh', {
      refresh_token: refreshToken,
    }).pipe(
      tap((tokens) => this.storeTokens(tokens, this.isPersistent())),
      map((tokens) => tokens.token),
      finalize(() => (this.refreshInFlight$ = null)),
      shareReplay(1)
    );

    return this.refreshInFlight$;
  }

  logout(redirectTo: string = '/auth/login'): void {
    this.clearStorage();
    this.currentUser.set(null);
    this.router.navigate([redirectTo]);
  }

  // ------------------------------------------------------------- Stockage

  private storeTokens(tokens: IAuthTokens, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    // Un changement de support doit purger l'ancien, sinon deux jetons coexistent.
    this.clearStorage();
    storage.setItem(TOKEN_KEY, tokens.token);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  private storeUser(user: IUser, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readStoredUser(): IUser | null {
    const raw = this.storage()?.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as IUser;
    } catch {
      return null;
    }
  }

  /** Support de stockage actif : celui qui contient le jeton. */
  private storage(): Storage | null {
    if (localStorage.getItem(TOKEN_KEY)) {
      return localStorage;
    }
    if (sessionStorage.getItem(TOKEN_KEY)) {
      return sessionStorage;
    }
    return null;
  }

  private isPersistent(): boolean {
    return this.storage() === localStorage;
  }

  private clearStorage(): void {
    [localStorage, sessionStorage].forEach((storage) => {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
      storage.removeItem(USER_KEY);
    });
  }
}
