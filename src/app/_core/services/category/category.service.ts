import { Injectable } from '@angular/core';
import { AppService } from '../AppService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environements/environement';
import { IApiResponse, ICategory, IPaginated } from '../../model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends AppService {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  /** Réponse enveloppée et paginée : `{ message, status, data: { items } }`. */
  getCategoriesPage(page = 1, itemsPerPage = 100): Observable<IPaginated<ICategory>> {
    const params = new HttpParams()
      .set('page', page)
      .set('itemsPerPage', itemsPerPage);

    return this.get<IApiResponse<IPaginated<ICategory>>>('/categories', params).pipe(
      map((response) => response.data)
    );
  }

  getAllCategries(page = 1): Observable<ICategory[]> {
    return this.getCategoriesPage(page).pipe(map((data) => data.items));
  }
}
