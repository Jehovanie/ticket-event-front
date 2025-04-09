import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environements/environement.test';
import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { IUser } from '../../model/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends AppService<IUser> {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }
}
