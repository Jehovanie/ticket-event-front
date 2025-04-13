import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { IOrganizer } from '../../model/organizer.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizerService extends AppService<IOrganizer> {

  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

    getAllOrganizers(page = 0): Observable<IOrganizer[]> {
      return this.getAll('/organizers');
    }
}
