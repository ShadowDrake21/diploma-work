import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'publications';

  getAllPublications(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getPublicationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPublication(publication: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, publication);
  }

  updatePublication(id: string, publication: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, publication);
  }

  deletePublication(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
