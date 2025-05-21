import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import {
  CreatePublicationRequest,
  PublicationDTO,
  UpdatePublicationRequest,
} from '@models/publication.model';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'publications';

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
    return this.http.get<
      ApiResponse<PublicationDTO[]> | PaginatedResponse<PublicationDTO[]>
    >(this.apiUrl, {
      ...getAuthHeaders(),
      params,
    });
  }

  getPublicationById(id: string): Observable<ApiResponse<PublicationDTO>> {
    return this.http.get<ApiResponse<PublicationDTO>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }

  createPublication(
    request: CreatePublicationRequest
  ): Observable<ApiResponse<PublicationDTO>> {
    return this.http.post<ApiResponse<PublicationDTO>>(
      this.apiUrl,
      request,
      getAuthHeaders()
    );
  }

  // TODO: finish authors publication

  updatePublication(
    id: string,
    request: UpdatePublicationRequest
  ): Observable<ApiResponse<PublicationDTO>> {
    return this.http.put<ApiResponse<PublicationDTO>>(
      `${this.apiUrl}/${id}`,
      request,
      getAuthHeaders()
    );
  }

  deletePublication(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }
}
