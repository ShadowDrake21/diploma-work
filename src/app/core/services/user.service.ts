import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ProjectType } from '@shared/enums/categories.enum';
import { PageResponse } from '@shared/types/generics.types';
import {
  IAuthorizedUser,
  ICreateUser,
  IUpdateUserProfile,
  IUser,
} from '@shared/types/users.types';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ProjectService } from './project.service';
import { ProjectDTO } from '@models/project.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private projectService = inject(ProjectService);
  private apiUrl = BASE_URL + 'users';

  public getPaginatedUsers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id'
  ): Observable<PageResponse<IUser>> {
    return this.http.get<PageResponse<IUser>>(
      `${this.apiUrl}?page=${page}&size=${size}&sortBy=${sortBy}`,
      getAuthHeaders()
    );
  }

  public getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.apiUrl}/list`, getAuthHeaders());
  }

  public createUser(user: ICreateUser): Observable<IAuthorizedUser> {
    return this.http.post<IAuthorizedUser>(this.apiUrl, user, getAuthHeaders());
  }

  public getUserById(id: number): Observable<IAuthorizedUser> {
    return this.http.get<IAuthorizedUser>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }

  public getFullUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/${id}/info`, getAuthHeaders());
  }

  public getUserByEmail(email: string): Observable<IAuthorizedUser> {
    return this.http.get<IAuthorizedUser>(
      `${this.apiUrl}/email/${email}`,
      getAuthHeaders()
    );
  }

  public getUsersByRole(role: string): Observable<IAuthorizedUser[]> {
    return this.http.get<IAuthorizedUser[]>(
      `${this.apiUrl}/role/${role}`,
      getAuthHeaders()
    );
  }

  public userExistsByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/exists/${email}`,
      getAuthHeaders()
    );
  }

  public getCurrentUser(): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/me`, getAuthHeaders());
  }

  public updateUserProfile(profileData: IUpdateUserProfile): Observable<IUser> {
    return this.http.patch<IUser>(
      `${this.apiUrl}/me/profile`,
      profileData,
      getAuthHeaders()
    );
  }

  public updateUserAvatar(file: File): Observable<IUser> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<IUser>(
      `${this.apiUrl}/me/avatar`,
      formData,
      getAuthHeaders()
    );
  }

  public getUserProjects(userId: string): Observable<ProjectDTO[]> {
    return this.http.get<ProjectDTO[]>(
      `${this.apiUrl}/${userId}/projects`,
      getAuthHeaders()
    );
  }

  public getCurrentUserProjects(): Observable<ProjectDTO[]> {
    return this.http.get<ProjectDTO[]>(
      `${this.apiUrl}/me/projects`,
      getAuthHeaders()
    );
  }

  public searchUsers(
    query: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id'
  ): Observable<PageResponse<IUser>> {
    return this.http.get<PageResponse<IUser>>(
      `${this.apiUrl}/search?query=${query}&page=${page}&size=${size}&sortBy=${sortBy}`,
      getAuthHeaders()
    );
  }

  getProjectsWithDetails(userId: string): Observable<ProjectDTO[]> {
    return this.getUserProjects(userId).pipe(
      switchMap((projects) => {
        return forkJoin(
          projects.map((project) => {
            if (project.type === ProjectType.PUBLICATION) {
              return this.projectService
                .getPublicationByProjectId(project.id)
                .pipe(
                  map((publication) => ({
                    ...project,
                    publication,
                  }))
                );
            } else if (project.type === ProjectType.PATENT) {
              return this.projectService
                .getPatentByProjectId(project.id)
                .pipe(map((patent) => ({ ...project, patent })));
            } else if (project.type === ProjectType.RESEARCH) {
              return this.projectService
                .getResearchByProjectId(project.id)
                .pipe(map((research) => ({ ...project, research })));
            }
            return of(project);
          })
        );
      })
    );
  }

  public getUserCollaborators(userId: string): Observable<IUser[]> {
    return this.http.get<IUser[]>(
      `${this.apiUrl}/${userId}/collaborators`,
      getAuthHeaders()
    );
  }

  // Delete User by ID
  public deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, getAuthHeaders());
  }
}
