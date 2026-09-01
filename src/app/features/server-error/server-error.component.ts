import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription, interval, takeUntil } from 'rxjs';
import { HealthService } from '@/app/_core/services/health/health.service';
import { NotificationService } from '@/app/_shared/services/notification.service';
import { environment } from '@/app/environements/environement';

/** Délai avant une nouvelle sonde automatique — assez long pour ne pas marteler l'API qui redémarre. */
const RETRY_DELAY_SECONDS = 15;

/**
 * Page affichée quand l'API ne répond plus (serveur arrêté, réseau, 5xx).
 *
 * Contrairement au 404, l'erreur est *transitoire* : la page interroge donc
 * `GET /health` en boucle et renvoie l'utilisateur là où il était dès que le
 * serveur répond de nouveau, sans qu'il ait à recharger quoi que ce soit.
 */
@Component({
  selector: 'app-server-error',
  imports: [RouterLink, MatIconModule],
  templateUrl: './server-error.component.html',
  styles: ``,
})
export class ServerErrorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly health = inject(HealthService);
  private readonly notification = inject(NotificationService);

  private readonly destroy$ = new Subject<void>();
  private countdown?: Subscription;

  /** Adresse de l'API interrogée : la donnée la plus utile pour diagnostiquer. */
  readonly apiUrl = environment.apiUrl;

  /** Code HTTP à l'origine de la bascule, transmis par l'intercepteur. */
  status = 0;

  /** Page à rouvrir une fois l'API revenue. */
  private returnUrl = '/dashboard';

  state = {
    isChecking: false,
    /** Nombre de sondes déjà effectuées, affiché pour montrer que ça tourne. */
    attempts: 0,
    secondsBeforeRetry: 0,
  };

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    this.status = Number(params.get('status') ?? 0);
    this.returnUrl = params.get('returnUrl') || '/dashboard';

    this.checkNow();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Titre et explication dépendent de la panne : injoignable ≠ erreur interne. */
  get isUnreachable(): boolean {
    return this.status === 0;
  }

  get title(): string {
    return this.isUnreachable
      ? 'Le serveur est injoignable'
      : 'Le serveur a rencontré une erreur';
  }

  get description(): string {
    return this.isUnreachable
      ? "L'application n'arrive pas à joindre l'API. Le serveur est peut-être arrêté, en cours de redémarrage, ou votre connexion est interrompue."
      : "L'API a répondu par une erreur interne. Le problème vient du serveur, pas de votre saisie : il n'y a rien à corriger de votre côté.";
  }

  checkNow(): void {
    this.stopCountdown();
    this.state = { ...this.state, isChecking: true, secondsBeforeRetry: 0 };

    this.health
      .check()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.state = {
          ...this.state,
          isChecking: false,
          attempts: this.state.attempts + 1,
        };

        if (result.isUp) {
          this.notification.success('Le serveur répond de nouveau.', 'Connexion rétablie');
          this.router.navigateByUrl(this.returnUrl);
          return;
        }

        this.status = result.status;
        this.startCountdown();
      });
  }

  private startCountdown(): void {
    this.state = { ...this.state, secondsBeforeRetry: RETRY_DELAY_SECONDS };

    this.countdown = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const remaining = this.state.secondsBeforeRetry - 1;
        this.state = { ...this.state, secondsBeforeRetry: remaining };

        if (remaining <= 0) {
          this.checkNow();
        }
      });
  }

  private stopCountdown(): void {
    this.countdown?.unsubscribe();
    this.countdown = undefined;
  }
}
