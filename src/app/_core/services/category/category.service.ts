import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { ICategory } from '../../model/category.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends AppService<ICategory> {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  getAllCategries(page = 0): Observable<ICategory[]> {
    return this.getAll('/categories');
  }
}
