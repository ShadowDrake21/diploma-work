import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { PaginatedResponse } from '@models/api-response.model';
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
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly apiUrl = BASE_URL + 'researches';

  getAll(): Observable<ResearchDTO[]>;
  getAll(
    page: number,
    size: number
  ): Observable<PaginatedResponse<ResearchDTO>>;

  getAll(
    page?: number,
    size?: number
  ): Observable<ResearchDTO[] | PaginatedResponse<ResearchDTO>> {
    let params = new HttpParams();
    if (page !== undefined && size !== undefined) {
      params = params
        .set('page', page.toString())
        .set('pageSize', size.toString());
    }

    return this.http
      .get<ResearchDTO[] | PaginatedResponse<ResearchDTO>>(this.apiUrl, {
        ...getAuthHeaders(),
        params,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити дослідження`
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
            `Не вдалося завантажити дослідження з ідентифікатором ${id}`
          )
        )
      );
  }

  create(request: CreateResearchRequest): Observable<ResearchDTO> {
    return this.http
      .post<ResearchDTO>(this.apiUrl, request, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося створити дослідження`
          )
        )
      );
  }

  update(id: string, research: UpdateResearchRequest): Observable<ResearchDTO> {
    console.log('updateResearch', research);
    return this.http
      .put<ResearchDTO>(`${this.apiUrl}/${id}`, research, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося оновити дослідження з ідентифікатором ${id}`
          )
        )
      );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося видалити дослідження з ідентифікатором ${id}`
          )
        )
      );
  }
}
