import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class AppService<T> {
  constructor(private httpClient: HttpClient, private baseUrl: string) {}

  get(url: string): Observable<T> {
    return this.httpClient.get<T>(`${this.baseUrl}${url}`);
  }

  getAll(url: string): Observable<T[]> {
    return this.httpClient.get<T[]>(`${this.baseUrl}${url}`);
  }

  create(url: string, data: T): Observable<T> {
    return this.httpClient.post<T>(`${this.baseUrl}${url}`, data);
  }

  update(url: string, data: T): Observable<T> {
    return this.httpClient.put<T>(`${this.baseUrl}${url}`, data);
  }

  delete(url: string): Observable<T> {
    return this.httpClient.delete<T>(`${this.baseUrl}${url}`);
  }
}
