import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export class AppService<T> {
  headers!: HttpHeaders;

  constructor(private httpClient: HttpClient, private baseUrl: string) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  get(url: string): Observable<T> {
    return this.httpClient.get<T>(`${this.baseUrl}${url}`, {
      headers: this.headers,
    });
  }

  getAll(url: string): Observable<T[]> {
    return this.httpClient.get<T[]>(`${this.baseUrl}${url}`, {
      headers: this.headers,
    });
  }

  create(url: string, data: T): Observable<T> {
    return this.httpClient.post<T>(`${this.baseUrl}${url}`, data, {
      headers: this.headers,
    });
  }

  update(url: string, data: T): Observable<T> {
    return this.httpClient.put<T>(`${this.baseUrl}${url}`, data, {
      headers: this.headers,
    });
  }

  delete(url: string): Observable<T> {
    return this.httpClient.delete<T>(`${this.baseUrl}${url}`, {
      headers: this.headers,
    });
  }
}
