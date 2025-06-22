import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { catchError, Observable } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import {
  CreateProjectRequest,
  ProjectDTO,
  UpdateProjectRequest,
} from '@models/project.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { PaginatedResponse } from '@models/api-response.model';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';
import { ResearchDTO } from '@models/research.model';
import { PatentDTO } from '@models/patent.model';
import { PublicationDTO } from '@models/publication.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly apiUrl = BASE_URL + 'projects';

  getAllProjects(): Observable<ProjectDTO[]>;

  getAllProjects(
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<ProjectDTO>>;

  getAllProjects(
    page?: number,
    size?: number
  ): Observable<ProjectDTO[] | PaginatedResponse<ProjectDTO>> {
    let params = new HttpParams();

    if (page !== undefined && size !== undefined) {
      params = params.set('page', page.toString()).set('size', size.toString());
    }
    return this.http
      .get<ProjectDTO[] | PaginatedResponse<ProjectDTO>>(this.apiUrl, {
        ...getAuthHeaders(),
        params,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            'Не вдалося завантажити проекти'
          )
        )
      );
  }

  getProjectById(id: string): Observable<ProjectDTO> {
    return this.http
      .get<ProjectDTO>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити проєкт з ідентифікатором ${id}`
          )
        )
      );
  }

  getPublicationByProjectId(projectId: string): Observable<PublicationDTO> {
    return this.http
      .get<PublicationDTO>(
        `${this.apiUrl}/${projectId}/publication`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити публікацію з ідентифікатором ${projectId}`
          )
        )
      );
  }

  getPatentByProjectId(projectId: string): Observable<PatentDTO> {
    return this.http
      .get<PatentDTO>(`${this.apiUrl}/${projectId}/patent`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити патент з ідентифікатором ${projectId}`
          )
        )
      );
  }

  getResearchByProjectId(projectId: string): Observable<ResearchDTO> {
    return this.http
      .get<ResearchDTO>(
        `${this.apiUrl}/${projectId}/research`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити дослідження з ідентифікатором ${projectId}`
          )
        )
      );
  }

  createProject(request: CreateProjectRequest): Observable<string> {
    console.log('Creating project with request:', request);
    return this.http
      .post<string>(this.apiUrl, request, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося створити проєкт`
          )
        )
      );
  }

  updateProject(id: string, request: UpdateProjectRequest): Observable<string> {
    return this.http
      .put<string>(`${this.apiUrl}/${id}`, request, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося оновити проект з ідентифікатором ${id}`
          )
        )
      );
  }

  deleteProject(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося видалити проект з ідентифікатором ${id}`
          )
        )
      );
  }

  getTypedProjectsByProjectId<T>(
    projectId: string,
    type: ProjectType
  ): Observable<T> {
    const endpointMap = {
      [ProjectType.PUBLICATION]: 'publication',
      [ProjectType.PATENT]: 'patent',
      [ProjectType.RESEARCH]: 'research',
    };

    return this.http
      .get<T>(
        `${this.apiUrl}/${projectId}/${endpointMap[type]}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            this.getTypeSpecificErrorMessage(type, projectId)
          )
        )
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
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося знайти проекти`
          )
        )
      );
  }

  getNewestProjects(
    limit: number = 10
  ): Observable<PaginatedResponse<ProjectDTO>> {
    return this.http
      .get<PaginatedResponse<ProjectDTO>>(
        `${this.apiUrl}/newest?limit=${limit}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити найновіші проекти`
          )
        )
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

    params = this.setFilterProjectParams(filters, params);

    return this.http
      .get<PaginatedResponse<ProjectDTO>>(`${this.apiUrl}/mine`, {
        params,
        ...getAuthHeaders(),
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Не вдалося завантажити проекти поточного користувача`
          )
        )
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

  private setFilterProjectParams = (
    filters: ProjectSearchFilters,
    params: HttpParams
  ): HttpParams => {
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

    return params;
  };

  private getTypeSpecificErrorMessage(
    type: ProjectType,
    projectId: string
  ): string {
    const typeNames = {
      [ProjectType.PUBLICATION]: 'publication',
      [ProjectType.PATENT]: 'patent',
      [ProjectType.RESEARCH]: 'research',
    };
    return `Не вдалося отримати дані ${typeNames[type]} для проєкту ${projectId}`;
  }
}
