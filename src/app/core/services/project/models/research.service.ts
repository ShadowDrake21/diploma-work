import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import {
  CreateResearchRequest,
  ResearchDTO,
  UpdateResearchRequest,
} from '@models/research.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResearchService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'researches';

  getAll(): Observable<ApiResponse<ResearchDTO[]>>;
  getAll(
    page: number,
    size: number
  ): Observable<PaginatedResponse<ResearchDTO[]>>;

  getAll(
    page?: number,
    size?: number
  ): Observable<ApiResponse<ResearchDTO[]> | PaginatedResponse<ResearchDTO[]>> {
    let params = new HttpParams();
    if (page !== undefined && size !== undefined) {
      params = params
        .set('page', page.toString())
        .set('pageSize', size.toString());
    }

    return this.http.get<
      ApiResponse<ResearchDTO[]> | PaginatedResponse<ResearchDTO[]>
    >(this.apiUrl, {
      ...getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ResearchDTO> {
    return this.http.get<ResearchDTO>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateResearchRequest): Observable<ApiResponse<ResearchDTO>> {
    return this.http.post<ApiResponse<ResearchDTO>>(
      this.apiUrl,
      request,
      getAuthHeaders()
    );
  }

  update(
    id: string,
    research: UpdateResearchRequest
  ): Observable<ApiResponse<ResearchDTO>> {
    console.log('updateResearch', research);
    return this.http.put<ApiResponse<ResearchDTO>>(
      `${this.apiUrl}/${id}`,
      research,
      getAuthHeaders()
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }
}
