import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { Injectable } from '@angular/core';
import { AppService } from '../AppService';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends AppService {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }
}
