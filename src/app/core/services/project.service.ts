import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { Project } from '@shared/types/project.types';
import { ProjectSearchResponse } from '@shared/types/search.types';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { UserService } from './user.service';
import { ProjectType } from '@shared/enums/categories.enum';

interface ProjectFilters {
  search?: string;
  types?: string[];
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  assigned?: boolean;
  inProgress?: boolean;
  completed?: boolean;
  progressMin?: number;
  progressMax?: number;
  publicationSource?: string;
  doiIsbn?: string;
  minBudget?: number;
  maxBudget?: number;
  fundingSource?: string;
  registrationNumber?: string;
  issuingAuthority?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = BASE_URL + 'projects';

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    });
  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}`, {
      headers: this.headers,
    });
  }

  getProjectById(id: string): Observable<Project> {
    console.log('getProjectById', `${this.apiUrl}/${id}`);
    return this.http
      .get<Project>(`${this.apiUrl}/${id}`, {
        headers: this.headers,
      })
      .pipe(
        tap((response) => console.log('Project response:', response)),
        catchError((error) => {
          console.error('Error fetching project:', error);
          throw error;
        })
      );
  }

  getPublicationByProjectId(projectId: string): Observable<any> {
    console.log(
      'getPublicationByProjectId',
      `${this.apiUrl}/${projectId}/publication`
    );
    return this.http.get(`${this.apiUrl}/${projectId}/publication`, {
      headers: this.headers,
    });
  }

  getPatentByProjectId(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/patent`, {
      headers: this.headers,
    });
  }

  getResearchByProjectId(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/research`, {
      headers: this.headers,
    });
  }

  createProject(project: any): Observable<any> {
    console.log('createProject', project);
    return this.http.post(`${this.apiUrl}`, project, {
      headers: this.headers,
    });
  }

  updateProject(id: string, project: any): Observable<any> {
    console.log('updateProject', project);
    return this.http.put(`${this.apiUrl}/${id}`, project, {
      headers: this.headers,
    });
  }

  searchProjects(filters: any): Observable<ProjectSearchResponse> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);

    if (filters.types.length)
      params = params.set('types', filters.types.join(','));
    if (filters.tags.length)
      params = params.set('tags', filters.tags.join(','));
    if (filters.startDate)
      params = params.set('startDate', filters.startDate || '');
    if (filters.endDate) params = params.set('endDate', filters.endDate || '');

    const statuses = [];

    if (filters.assigned) statuses.push('assigned');
    if (filters.isProgress) statuses.push('in_progress');
    if (filters.completed) statuses.push('completed');
    if (statuses.length) params = params.set('statuses', statuses.join(','));

    params = params.set('progressMin', filters.progressMin.toString());
    params = params.set('progressMax', filters.progressMax.toString());

    if (filters.publicationSource)
      params = params.set('publicationSource', filters.publicationSource);
    if (filters.doiIsbn) params = params.set('doiIsbn', filters.doiIsbn);
    if (filters.minBudget) params = params.set('minBudget', filters.minBudget);
    if (filters.maxBudget) params = params.set('maxBudget', filters.maxBudget);
    if (filters.fundingSource)
      params = params.set('fundingSource', filters.fundingSource);
    if (filters.registrationNumber)
      params = params.set('registrationNumber', filters.registrationNumber);
    if (filters.issuingAuthority)
      params = params.set('issuingAuthority', filters.issuingAuthority);

    return this.http
      .get<ProjectSearchResponse>(`${this.apiUrl}/search`, {
        params,
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  getNewestProjects(limit: number = 10): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/newest?limit=${limit}`, {
      headers: this.headers,
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }
}
