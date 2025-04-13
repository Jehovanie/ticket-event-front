import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { ILocation } from '../../model/location.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService extends AppService<ILocation> {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  getAllLocations(page = 0): Observable<ILocation[]> {
    return this.getAll('/locations');
  }
}
