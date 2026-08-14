import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environements/environement';
import { AppService } from '../AppService';
import { IApiResponse, IEvent, IEventStatusDetail, IPaginated } from '../../model';
import { map, Observable } from 'rxjs';

/** Nombre d'événements demandés par défaut au serveur. */
export const DEFAULT_EVENTS_PER_PAGE = 12;

@Injectable({
  providedIn: 'root',
})
export class EventsService extends AppService {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  /**
   * Liste paginée côté serveur.
   * @param page numéro de page indexé à partir de 1 (convention de l'API).
   */
  getAllEvents(
    page = 1,
    itemsPerPage = DEFAULT_EVENTS_PER_PAGE
  ): Observable<IPaginated<IEvent>> {
    const params = new HttpParams()
      .set('page', page)
      .set('itemsPerPage', itemsPerPage);

    return this.get<IApiResponse<IPaginated<IEvent>>>('/events', params).pipe(
      map((response) => response.data)
    );
  }

  getEvent(eventID: string | number): Observable<IEvent> {
    return this.get<IApiResponse<IEvent>>(`/events/${eventID}`).pipe(
      map((response) => response.data)
    );
  }

  /**
   * L'écriture ne renvoie pas forcément l'enveloppe `{ message, status, data }` :
   * selon l'endpoint, l'entité peut arriver à la racine, voire le corps être
   * vide. On déballe donc sans supposer la forme — sinon le résultat est
   * `undefined` et le composant appelant plante sur `createdEvent.title`.
   */
  createEvent(event: IEvent): Observable<IEvent | null> {
    return this.post<IApiResponse<IEvent> | IEvent | null>('/events', event).pipe(
      map((response) => this.unwrap(response))
    );
  }

  updateEvent(eventID: string | number, event: IEvent): Observable<IEvent | null> {
    return this.put<IApiResponse<IEvent> | IEvent | null>(`/events/${eventID}`, event).pipe(
      map((response) => this.unwrap(response))
    );
  }

  private unwrap(response: IApiResponse<IEvent> | IEvent | null): IEvent | null {
    if (!response) {
      return null;
    }
    if (typeof response === 'object' && 'data' in response) {
      return (response as IApiResponse<IEvent>).data ?? null;
    }
    return response as IEvent;
  }

  deleteEvent(eventID: string | number): Observable<void> {
    return this.remove<unknown>(`/events/${eventID}`).pipe(map(() => undefined));
  }

  /**
   * Statistiques de vente. Cet endpoint a sa propre forme :
   * `{ events: { event, statusTicket } }`, sans enveloppe `data`.
   */
  getDetailStatusEvent(
    eventID: string | number
  ): Observable<IEventStatusDetail> {
    return this.get<{ events: IEventStatusDetail }>(
      `/admin/events/${eventID}`
    ).pipe(map((response) => response.events));
  }
}
