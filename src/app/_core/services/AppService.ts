import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
