import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppService } from './AppService';
import { environment } from '../_core/.env.development';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService extends AppService<any> {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }
}
