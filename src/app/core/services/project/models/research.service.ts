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
import { catchError, Observable } from 'rxjs';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ResearchService {
  private http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
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

    return this.http
      .get<ApiResponse<ResearchDTO[]> | PaginatedResponse<ResearchDTO[]>>(
        this.apiUrl,
        {
          ...getAuthHeaders(),
          params,
        }
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to load researches`
          )
        )
      );
  }

  getById(id: string): Observable<ResearchDTO> {
    return this.http
      .get<ResearchDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to load research with ID ${id}`
          )
        )
      );
  }

  create(request: CreateResearchRequest): Observable<ApiResponse<ResearchDTO>> {
    return this.http
      .post<ApiResponse<ResearchDTO>>(this.apiUrl, request, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to create research`
          )
        )
      );
  }

  update(
    id: string,
    research: UpdateResearchRequest
  ): Observable<ApiResponse<ResearchDTO>> {
    console.log('updateResearch', research);
    return this.http
      .put<ApiResponse<ResearchDTO>>(
        `${this.apiUrl}/${id}`,
        research,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to update research with ID ${id}`
          )
        )
      );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to delete research with ID ${id}`
          )
        )
      );
  }
}
