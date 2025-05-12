import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'tags';

  getAllTags(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, getAuthHeaders());
  }

  getTagById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, getAuthHeaders());
  }

  createTag(tag: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, tag, getAuthHeaders());
  }

  updateTag(id: string, tag: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, tag, getAuthHeaders());
  }

  deleteTag(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, getAuthHeaders());
  }
}
