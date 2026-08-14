import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY, expand, map, Observable, reduce } from 'rxjs';
import { IHydraCollection } from '../model';

/**
 * Base de tous les services HTTP.
 *
 * Les méthodes sont volontairement `protected` et typées par la *réponse brute*
 * (`R`), enveloppe comprise : l'API ne renvoie jamais un tableau ou une entité
 * nue. Chaque service concret expose des méthodes métier qui déballent la
 * réponse (voir `EventsService`), afin qu'aucun composant ne manipule
 * l'enveloppe.
 */
export class AppService {
  protected headers: HttpHeaders;

  constructor(protected httpClient: HttpClient, protected baseUrl: string) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  protected get<R>(url: string, params?: HttpParams): Observable<R> {
    return this.httpClient.get<R>(`${this.baseUrl}${url}`, {
      headers: this.headers,
      params,
    });
  }

  protected post<R>(url: string, body: unknown): Observable<R> {
    return this.httpClient.post<R>(`${this.baseUrl}${url}`, body, {
      headers: this.headers,
    });
  }

  protected put<R>(url: string, body: unknown): Observable<R> {
    return this.httpClient.put<R>(`${this.baseUrl}${url}`, body, {
      headers: this.headers,
    });
  }

  protected remove<R>(url: string): Observable<R> {
    return this.httpClient.delete<R>(`${this.baseUrl}${url}`, {
      headers: this.headers,
    });
  }

  /**
   * Récupère une collection de référence en entier.
   *
   * L'API plafonne `itemsPerPage` (30 sur `/organizers`, qui en compte 32) : sans
   * enchaîner les pages, les derniers éléments seraient absents des listes
   * déroulantes. On s'arrête dès qu'une page n'est pas pleine.
   *
   * La forme des éléments dépend de la négociation de contenu : tableau simple
   * avec `Accept: application/json`, enveloppe Hydra sinon.
   */
  protected getAllPages<R>(
    url: string,
    pageSize = 30,
    maxPages = 20
  ): Observable<R[]> {
    const fetchPage = (page: number): Observable<R[]> =>
      this.get<R[] | IHydraCollection<R>>(
        url,
        new HttpParams().set('page', page).set('itemsPerPage', pageSize)
      ).pipe(map((response) => (Array.isArray(response) ? response : response.member ?? [])));

    return fetchPage(1).pipe(
      expand((items, index) =>
        items.length === pageSize && index + 1 < maxPages
          ? fetchPage(index + 2)
          : EMPTY
      ),
      reduce((all, items) => [...all, ...items], [] as R[])
    );
  }
}
