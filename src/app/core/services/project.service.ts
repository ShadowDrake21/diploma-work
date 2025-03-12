import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { Project } from '@shared/types/project.types';
import { catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'projects';

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  getProjectById(id: string): Observable<Project> {
    console.log('getProjectById', `${this.apiUrl}/${id}`);
    return this.http
      .get<Project>(`${this.apiUrl}/${id}`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        }),
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
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  getPatentByProjectId(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/patent`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  getResearchByProjectId(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/research`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  createProject(project: any): Observable<any> {
    console.log('createProject', project);
    return this.http.post(`${this.apiUrl}`, project, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  updateProject(id: string, project: any): Observable<any> {
    console.log('updateProject', project);
    return this.http.put(`${this.apiUrl}/${id}`, project, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }
}
