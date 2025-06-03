import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import {
  CreatePublicationRequest,
  PublicationDTO,
  UpdatePublicationRequest,
} from '@models/publication.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, Observable } from 'rxjs';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly apiUrl = BASE_URL + 'publications';

  getAllPublications(): Observable<ApiResponse<PublicationDTO[]>>;

  getAllPublications(
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<PublicationDTO[]>>;

  getAllPublications(
    page?: number,
    pageSize?: number
  ): Observable<
    ApiResponse<PublicationDTO[]> | PaginatedResponse<PublicationDTO[]>
  > {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
    }
    return this.http
      .get<ApiResponse<PublicationDTO[]> | PaginatedResponse<PublicationDTO[]>>(
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
            `Failed to load publications`
          )
        )
      );
  }

  getPublicationById(id: string): Observable<ApiResponse<PublicationDTO>> {
    return this.http
      .get<ApiResponse<PublicationDTO>>(
        `${this.apiUrl}/${id}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to load publication with ID ${id}`
          )
        )
      );
  }

  createPublication(
    request: CreatePublicationRequest
  ): Observable<ApiResponse<PublicationDTO>> {
    return this.http
      .post<ApiResponse<PublicationDTO>>(this.apiUrl, request, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to create publication`
          )
        )
      );
  }

  // TODO: finish authors publication

  updatePublication(
    id: string,
    request: UpdatePublicationRequest
  ): Observable<ApiResponse<PublicationDTO>> {
    return this.http
      .put<ApiResponse<PublicationDTO>>(
        `${this.apiUrl}/${id}`,
        request,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to update publication with ID ${id}`
          )
        )
      );
  }

  deletePublication(id: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to delete publication with ID ${id}`
          )
        )
      );
  }
}
