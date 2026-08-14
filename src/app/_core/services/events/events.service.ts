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

  createEvent(event: IEvent): Observable<IEvent> {
    return this.post<IApiResponse<IEvent>>('/events', event).pipe(
      map((response) => response.data)
    );
  }

  updateEvent(eventID: string | number, event: IEvent): Observable<IEvent> {
    return this.put<IApiResponse<IEvent>>(`/events/${eventID}`, event).pipe(
      map((response) => response.data)
    );
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
