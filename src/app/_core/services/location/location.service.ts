import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { ILocation } from '../../model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService extends AppService {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  /** Liste complète, toutes pages confondues (l'API plafonne à 30 par page). */
  getAllLocations(): Observable<ILocation[]> {
    return this.getAllPages<ILocation>('/locations');
  }
}
