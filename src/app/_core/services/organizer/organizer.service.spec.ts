import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { OrganizerService } from './organizer.service';
import { IMyOrganizations, IMyOrganizer } from '../../model';
import { environment } from '../../../environements/environement';

describe('OrganizerService', () => {
  let service: OrganizerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrganizerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMyOrganizations', () => {
    // La page « Organisateurs » a besoin du drapeau, pas du repli : il distingue
    // « aucune organisation » de « rôle global ».
    it('conserve `isSuperAdmin` au lieu de basculer sur /organizers', () => {
      let result: IMyOrganizations | undefined;
      service.getMyOrganizations().subscribe((r) => (result = r));

      httpMock.expectOne(`${environment.apiUrl}/user/me/organizations`).flush({
        message: 'ok',
        status: 200,
        data: { itemsTotal: 0, isSuperAdmin: true, items: [] },
      });

      expect(result?.isSuperAdmin).toBeTrue();
      expect(result?.items).toEqual([]);
      // Aucun appel de repli : `httpMock.verify()` échouerait sinon.
    });
  });

  describe('createOrganizer', () => {
    it('poste sur /organizers et déballe `data`', () => {
      let created: IMyOrganizer | undefined;
      service
        .createOrganizer({ name: 'Antsika Prod', email: 'contact@antsika.mg' })
        .subscribe((r) => (created = r));

      const request = httpMock.expectOne(`${environment.apiUrl}/organizers`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body.name).toBe('Antsika Prod');

      request.flush({
        message: 'créée',
        status: 201,
        data: {
          id: 9,
          name: 'Antsika Prod',
          email: 'contact@antsika.mg',
          role: 'owner',
          roleLabel: 'Responsable',
          isOwner: true,
        },
      });

      expect(created?.id).toBe(9);
      expect(created?.isOwner).toBeTrue();
    });
  });

  describe('getMyOrganizers', () => {
    // L'endpoint renvoie l'enveloppe maison `{ message, status, data }` et non un
    // tableau nu : la déballer est justement ce qui manquait au sélecteur.
    it('déballe `data.items`', () => {
      let organizers: IMyOrganizer[] | undefined;
      service.getMyOrganizers().subscribe((result) => (organizers = result));

      httpMock
        .expectOne(`${environment.apiUrl}/user/me/organizations`)
        .flush({
          message: 'ok',
          status: 200,
          data: {
            itemsTotal: 1,
            isSuperAdmin: false,
            items: [
              { id: 2, name: 'Madagascar Events', email: 'hello@me.mg', role: 'owner' },
            ],
          },
        });

      expect(organizers?.length).toBe(1);
      expect(organizers?.[0].name).toBe('Madagascar Events');
    });

    // Le rôle global ne crée aucune appartenance : sans repli, le fondateur
    // n'aurait aucun organisateur à choisir.
    it('bascule sur /organizers pour un super administrateur', () => {
      let organizers: IMyOrganizer[] | undefined;
      service.getMyOrganizers().subscribe((result) => (organizers = result));

      httpMock.expectOne(`${environment.apiUrl}/user/me/organizations`).flush({
        message: 'ok',
        status: 200,
        data: { itemsTotal: 0, isSuperAdmin: true, items: [] },
      });

      httpMock
        .expectOne(
          `${environment.apiUrl}/organizers?page=1&itemsPerPage=30`
        )
        .flush([{ id: 1, name: 'Tech Madagascar' }]);

      expect(organizers?.length).toBe(1);
      expect(organizers?.[0].name).toBe('Tech Madagascar');
    });
  });
});
