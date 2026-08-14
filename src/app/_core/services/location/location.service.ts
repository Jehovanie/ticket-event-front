import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { IHydraCollection, ILocation } from '../../model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService extends AppService {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  /** Endpoint au format Hydra : les lieux sont dans `member`. */
  getAllLocations(page = 1, itemsPerPage = 100): Observable<ILocation[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('itemsPerPage', itemsPerPage);

    return this.get<IHydraCollection<ILocation>>('/locations', params).pipe(
      map((collection) => collection.member ?? [])
    );
  }
}
