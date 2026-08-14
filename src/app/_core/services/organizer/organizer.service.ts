import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { IHydraCollection, IOrganizer } from '../../model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizerService extends AppService {

  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  /** Endpoint au format Hydra : les organisateurs sont dans `member`. */
  getAllOrganizers(page = 1, itemsPerPage = 100): Observable<IOrganizer[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('itemsPerPage', itemsPerPage);

    return this.get<IHydraCollection<IOrganizer>>('/organizers', params).pipe(
      map((collection) => collection.member ?? [])
    );
  }
}
