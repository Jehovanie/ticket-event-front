import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { EventsService } from './events.service';
import { AuthService } from '../auth/auth.service';
import { IPaginated, IEvent } from '../../model';
import { environment } from '../../../environements/environement';

describe('EventsService', () => {
  let service: EventsService;
  let auth: AuthService;
  let httpMock: HttpTestingController;

  /** Un événement de liste, réduit au strict nécessaire pour le test. */
  const event = (id: string, title: string): IEvent =>
    ({ id, title } as unknown as IEvent);

  const page = (items: IEvent[]) => ({
    message: 'ok',
    status: 200,
    data: {
      itemsTotal: items.length,
      currentPage: 1,
      nombreParPage: 12,
      items,
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(EventsService);
    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMyEvents', () => {
    it('interroge /events/me et déballe `data`', () => {
      let result: IPaginated<IEvent> | undefined;
      auth.currentUser.set({ email: 'hery.rakoto@techmada.mg', roles: ['ROLE_USER'] });

      service.getMyEvents(1, 12).subscribe((r) => (result = r));

      httpMock
        .expectOne(`${environment.apiUrl}/events/me?page=1&itemsPerPage=12`)
        .flush(page([event('4', 'Les Nuits de Baobab 2027')]));

      expect(result?.itemsTotal).toBe(1);
      expect(result?.items[0].title).toBe('Les Nuits de Baobab 2027');
    });

    // Le rôle global ne crée aucune appartenance : `/events/me` répondrait `items: []`
    // au fondateur, à qui l'inventaire complet est justement destiné.
    it('bascule sur /events pour un super administrateur', () => {
      let result: IPaginated<IEvent> | undefined;
      auth.currentUser.set({
        email: 'admin@ticketup.mg',
        roles: ['ROLE_SUPER_ADMIN', 'ROLE_USER'],
      });

      service.getMyEvents(1, 12).subscribe((r) => (result = r));

      httpMock
        .expectOne(`${environment.apiUrl}/events?page=1&itemsPerPage=12`)
        .flush(page([event('1', 'Tout le catalogue')]));

      expect(result?.items[0].title).toBe('Tout le catalogue');
    });
  });
});
