import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { PaginatedResponse } from '@models/api-response.model';
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
  getAllPatents(): Observable<PatentDTO[]>;

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
  ): Observable<PatentDTO[] | PaginatedResponse<PatentDTO>> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
    }

    return this.http
      .get<PatentDTO[] | PaginatedResponse<PatentDTO>>(this.apiUrl, {
        ...getAuthHeaders(),
        params,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити патенти`
          )
        )
      );
  }

  /**
   * Get a specific patent by ID
   * @param id Patent ID
   * @returns Observable of patent data
   */
  getPatentById(id: string): Observable<PatentDTO> {
    return this.http
      .get<PatentDTO>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити патент з ідентифікатором ${id}`
          )
        )
      );
  }

  /**
   * Get co-inventors of a patent
   * @param patentId Patent ID
   * @returns Observable of co-inventor list
   */
  getPatentCoInventors(patentId: string): Observable<PatentCoInventorDTO[]> {
    return this.http
      .get<PatentCoInventorDTO[]>(
        `${this.apiUrl}/${patentId}/co-inventors`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити співвинахідників для патенту ${patentId}`
          )
        )
      );
  }

  /**
   * Create a new patent
   * @param patentData Patent creation data
   * @returns Observable of created patent
   */
  createPatent(patentData: CreatePatentRequest): Observable<PatentDTO> {
    return this.http
      .post<PatentDTO>(`${this.apiUrl}`, patentData, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося створити патент`
          )
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
  ): Observable<PatentDTO> {
    console.log('Updating patent with ID:', id);
    return this.http
      .put<PatentDTO>(`${this.apiUrl}/${id}`, patentData, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося оновити патент із ідентифікатором ${id}`
          )
        )
      );
  }

  /**
   * Delete a patent
   * @param id Patent ID to delete
   * @returns Observable of void
   */
  deletePatent(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося видалити патент з ідентифікатором ${id}`
          )
        )
      );
  }
}
