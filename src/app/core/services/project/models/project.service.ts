import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import {
  ProjectSearchFilters,
  ProjectSearchResponse,
} from '@shared/types/search.types';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import {
  CreateProjectRequest,
  ProjectDTO,
  ProjectWithDetails,
  UpdateProjectRequest,
} from '@models/project.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { ProjectStatistics } from '@models/project-statistics';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = BASE_URL + 'projects';

  getAllProjects(): Observable<ApiResponse<ProjectDTO[]>>;

  getAllProjects(
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<ProjectDTO>>;

  getAllProjects(
    page?: number,
    pageSize?: number
  ): Observable<ApiResponse<ProjectDTO[]> | PaginatedResponse<ProjectDTO[]>> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
    }
    return this.http.get<
      ApiResponse<ProjectDTO[]> | PaginatedResponse<ProjectDTO[]>
    >(this.apiUrl, {
      ...getAuthHeaders(),
      params,
    });
  }

  getProjectById(id: string): Observable<ApiResponse<ProjectDTO>> {
    return this.http.get<ApiResponse<ProjectDTO>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }

  getPublicationByProjectId(projectId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${projectId}/publication`,
      getAuthHeaders()
    );
  }

  getPatentByProjectId(projectId: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${projectId}/patent`, getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('Error fetching patent:', error);
          return of({
            success: false,
            message: 'Failed to fetch patent',
            data: null,
          });
        })
      );
  }

  getResearchByProjectId(projectId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${projectId}/research`,
      getAuthHeaders()
    );
  }

  createProject(
    request: CreateProjectRequest
  ): Observable<ApiResponse<string>> {
    console.log('Creating project with request:', request);
    return this.http
      .post<ApiResponse<string>>(this.apiUrl, request, getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('Failed to create project', error);
          return throwError(() => new Error('Failed to create project'));
        })
      );
  }

  updateProject(
    id: string,
    request: UpdateProjectRequest
  ): Observable<ApiResponse<string>> {
    return this.http
      .put<ApiResponse<string>>(
        `${this.apiUrl}/${id}`,
        request,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) => {
          console.error('Failed to update project', error);
          return throwError(() => new Error('Failed to update project'));
        })
      );
  }

  deleteProject(id: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('Failed to delete project during rollback', error);
          return throwError(
            () => new Error('Failed to delete project during rollback')
          );
        })
      );
  }

  getTypedProjectsByProjectId<T>(
    projectId: string,
    type: ProjectType
  ): Observable<ApiResponse<T>> {
    const endpointMap = {
      [ProjectType.PUBLICATION]: 'publication',
      [ProjectType.PATENT]: 'patent',
      [ProjectType.RESEARCH]: 'research',
    };

    return this.http.get<ApiResponse<T>>(
      `${this.apiUrl}/${projectId}/${endpointMap[type]}`,
      getAuthHeaders()
    );
  }

  searchProjects(
    filters: ProjectSearchFilters,
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<ProjectDTO>> {
    let params = this.buildSearchParams(filters, page, size);

    return this.http
      .get<PaginatedResponse<ProjectDTO>>(`${this.apiUrl}/search`, {
        params,
        ...getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getNewestProjects(limit: number = 10): Observable<ApiResponse<ProjectDTO[]>> {
    return this.http.get<ApiResponse<ProjectDTO[]>>(
      `${this.apiUrl}/newest?limit=${limit}`,
      getAuthHeaders()
    );
  }

  getMyProjects(
    filters: ProjectSearchFilters = {},
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<ProjectDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters.search) params = params.set('search', filters.search);
    if (filters.types?.length)
      params = params.set('types', filters.types.join(','));
    if (filters.tags?.length)
      params = params.set('tags', filters.tags.join(','));
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.progressMin !== undefined)
      params = params.set('progressMin', filters.progressMin.toString());
    if (filters.progressMax !== undefined)
      params = params.set('progressMax', filters.progressMax.toString());

    return this.http
      .get<PaginatedResponse<ProjectDTO>>(`${this.apiUrl}/mine`, {
        params,
        ...getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }

  private buildSearchParams(
    filters: ProjectSearchFilters,
    page: number,
    size: number
  ): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters.search) params = params.set('search', filters.search);
    if (filters.publicationSource)
      params = params.set('publicationSource', filters.publicationSource);
    if (filters.doiIsbn) params = params.set('doiIsbn', filters.doiIsbn);
    if (filters.registrationNumber)
      params = params.set('registrationNumber', filters.registrationNumber);
    if (filters.issuingAuthority)
      params = params.set('issuingAuthority', filters.issuingAuthority);
    if (filters.fundingSource)
      params = params.set('fundingSource', filters.fundingSource);

    if (filters.types?.length)
      params = params.set('types', filters.types.join(','));
    if (filters.tags?.length)
      params = params.set('tags', filters.tags.join(','));

    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    if (filters.progressMin !== undefined)
      params = params.set('progressMin', filters.progressMin.toString());
    if (filters.progressMax !== undefined)
      params = params.set('progressMax', filters.progressMax.toString());
    if (filters.minBudget !== undefined)
      params = params.set('minBudget', filters.minBudget.toString());
    if (filters.maxBudget !== undefined)
      params = params.set('maxBudget', filters.maxBudget.toString());

    if (filters.statuses?.length)
      params = params.set('statuses', filters.statuses.join(','));

    return params;
  }
}
