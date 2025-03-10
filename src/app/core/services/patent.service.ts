import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatentService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'patents';

  getAllPatents(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getPatentById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPatent(patent: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, patent, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  updatePatent(id: string, patent: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, patent, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  deletePatent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
