import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResearchService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'researches';

  getAllResearches(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getResearchById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createResearch(research: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, research);
  }

  updateResearch(id: string, research: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, research);
  }

  deleteResearch(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
