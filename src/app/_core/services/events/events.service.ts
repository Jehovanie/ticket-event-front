import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environements/environement';
import { AppService } from '../AppService';
import { IEvent } from '../../model/event.interface';

@Injectable({
  providedIn: 'root',
})
export class EventsService extends AppService<IEvent> {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }
}
