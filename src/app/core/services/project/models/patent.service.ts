import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import {
  CreatePatentRequest,
  PatentCoInventorDTO,
  PatentDTO,
  UpdatePatentRequest,
} from '@models/patent.model';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatentService {
  private readonly http = inject(HttpClient);
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

    return this.http.get<
      ApiResponse<PatentDTO[]> | PaginatedResponse<PatentDTO>
    >(this.apiUrl, {
      ...getAuthHeaders(),
      params,
    });
  }

  /**
   * Get a specific patent by ID
   * @param id Patent ID
   * @returns Observable of patent data
   */
  getPatentById(id: string): Observable<ApiResponse<PatentDTO>> {
    return this.http.get<ApiResponse<PatentDTO>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
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
    return this.http.post<ApiResponse<PatentDTO>>(
      `${this.apiUrl}`,
      patentData,
      getAuthHeaders()
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
    return this.http.put<ApiResponse<PatentDTO>>(
      `${this.apiUrl}/${id}`,
      patentData,
      getAuthHeaders()
    );
  }

  /**
   * Delete a patent
   * @param id Patent ID to delete
   * @returns Observable of void
   */
  deletePatent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
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
    return this.http.get<ApiResponse<PatentCoInventorDTO[]>>(
      `${this.apiUrl}/${patentId}/co-inventors`,
      getAuthHeaders()
    );
  }
}
