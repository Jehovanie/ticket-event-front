import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import {
  IApiResponse,
  ICreateOrganizerPayload,
  IMyOrganizations,
  IMyOrganizer,
  IOrganizer,
} from '../../model';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizerService extends AppService {

  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  /** Liste complète, toutes pages confondues (l'API plafonne à 30 par page). */
  getAllOrganizers(): Observable<IOrganizer[]> {
    return this.getAllPages<IOrganizer>('/organizers');
  }

  /**
   * Organisations de l'utilisateur connecté, avec son rôle dans chacune.
   *
   * Contrairement à `/organizers` (API Platform, tableau nu ou Hydra), cet
   * endpoint passe par un contrôleur maison et renvoie l'enveloppe
   * `{ message, status, data }` : il faut la déballer, pas la paginer.
   *
   * Le super administrateur n'appartient à aucune organisation — son rôle est
   * global — et reçoit donc `items: []` ; on bascule alors sur la liste complète,
   * sinon il ne pourrait choisir aucun organisateur.
   */
  getMyOrganizers(): Observable<IMyOrganizer[]> {
    return this.get<IApiResponse<IMyOrganizations>>(
      '/user/me/organizations'
    ).pipe(
      switchMap(({ data }) =>
        data.isSuperAdmin ? this.getAllOrganizers() : of(data.items)
      )
    );
  }

  /**
   * Même appel, réponse brute — `isSuperAdmin` compris.
   *
   * La page « Organisateurs » a besoin de distinguer « vous n'appartenez à
   * aucune organisation » de « votre rôle est global » : le repli silencieux de
   * `getMyOrganizers()` effacerait justement cette nuance, et les organisations
   * de repli arrivent sans rôle, qui est le sujet de la page.
   */
  getMyOrganizations(): Observable<IMyOrganizations> {
    return this.get<IApiResponse<IMyOrganizations>>(
      '/user/me/organizations'
    ).pipe(map((response) => response.data));
  }

  /**
   * Crée une organisation dont l'appelant devient responsable.
   *
   * L'API rattache le créateur dans la même transaction : l'organisation est
   * donc immédiatement visible dans `getMyOrganizations()`.
   */
  createOrganizer(payload: ICreateOrganizerPayload): Observable<IMyOrganizer> {
    return this.post<IApiResponse<IMyOrganizer>>('/organizers', payload).pipe(
      map((response) => response.data)
    );
  }
}
