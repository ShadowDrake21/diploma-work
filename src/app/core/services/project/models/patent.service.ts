import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import {
  CreatePatentRequest,
  PatentCoInventorDTO,
  PatentDTO,
  UpdatePatentRequest,
} from '@models/patent.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, Observable } from 'rxjs';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PatentService {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly apiUrl = BASE_URL + 'patents';
  /**
   * Get all patents without pagination
   * @returns Observable of all patent data
   */
  getAllPatents(): Observable<ApiResponse<PatentDTO[]>>;

  /**
   * Get patents with pagination
   * @param page Page number (1-based)
   * @param pageSize Items per page
   * @returns Observable of paginated patent results
   */
  getAllPatents(
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<PatentDTO>>;

  /**
   * Implmentation for both paginated and non-paginated requests
   */
  getAllPatents(
    page?: number,
    pageSize?: number
  ): Observable<ApiResponse<PatentDTO[]> | PaginatedResponse<PatentDTO>> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
    }

    return this.http
      .get<ApiResponse<PatentDTO[]> | PaginatedResponse<PatentDTO>>(
        this.apiUrl,
        {
          ...getAuthHeaders(),
          params,
        }
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(error, `Failed to load patents`)
        )
      );
  }

  /**
   * Get a specific patent by ID
   * @param id Patent ID
   * @returns Observable of patent data
   */
  getPatentById(id: string): Observable<ApiResponse<PatentDTO>> {
    return this.http
      .get<ApiResponse<PatentDTO>>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to load patent with ID ${id}`
          )
        )
      );
  }

  /**
   * Get co-inventors of a patent
   * @param patentId Patent ID
   * @returns Observable of co-inventor list
   */
  getPatentCoInventors(
    patentId: string
  ): Observable<ApiResponse<PatentCoInventorDTO[]>> {
    return this.http
      .get<ApiResponse<PatentCoInventorDTO[]>>(
        `${this.apiUrl}/${patentId}/co-inventors`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to load co-inventors for patent ${patentId}`
          )
        )
      );
  }

  /**
   * Create a new patent
   * @param patentData Patent creation data
   * @returns Observable of created patent
   */
  createPatent(
    patentData: CreatePatentRequest
  ): Observable<ApiResponse<PatentDTO>> {
    return this.http
      .post<ApiResponse<PatentDTO>>(
        `${this.apiUrl}`,
        patentData,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(error, `Failed to create patent`)
        )
      );
  }

  /**
   * Update an existing patent
   * @param id Patent ID to update
   * @param patentData Updated patent data
   * @returns Observable of updated patent
   */
  updatePatent(
    id: string,
    patentData: UpdatePatentRequest
  ): Observable<ApiResponse<PatentDTO>> {
    console.log('Updating patent with ID:', id);
    return this.http
      .put<ApiResponse<PatentDTO>>(
        `${this.apiUrl}/${id}`,
        patentData,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to update patent with ID ${id}`
          )
        )
      );
  }

  /**
   * Delete a patent
   * @param id Patent ID to delete
   * @returns Observable of void
   */
  deletePatent(id: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to delete patent with ID ${id}`
          )
        )
      );
  }
}
