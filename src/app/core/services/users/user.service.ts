import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ProjectType } from '@shared/enums/categories.enum';
import { PageResponse } from '@shared/types/generics.types';
import {
  IAuthorizedUser,
  ICreateUser,
  IUpdateUserProfile,
  IUser,
} from '@shared/models/user.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { ProjectService } from '../project/models/project.service';
import { ProjectDTO } from '@models/project.model';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';

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
    sort: string = 'createdAt,desc'
  ): Observable<PageResponse<IUser>> {
    return this.http.get<PageResponse<IUser>>(
      `${this.apiUrl}?page=${page}&size=${size}&sort=${sort}`,
      getAuthHeaders()
    );
  }

  public getAllUsers(): Observable<ApiResponse<IUser[]>> {
    return this.http.get<ApiResponse<IUser[]>>(
      `${this.apiUrl}/list`,
      getAuthHeaders()
    );
  }

  public createUser(
    user: ICreateUser
  ): Observable<ApiResponse<IAuthorizedUser>> {
    return this.http.post<ApiResponse<IAuthorizedUser>>(
      this.apiUrl,
      user,
      getAuthHeaders()
    );
  }

  public getUserById(id: number): Observable<ApiResponse<IAuthorizedUser>> {
    return this.http.get<ApiResponse<IAuthorizedUser>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }

  public getFullUserById(id: number): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(
      `${this.apiUrl}/${id}/info`,
      getAuthHeaders()
    );
  }

  public getUserByEmail(
    email: string
  ): Observable<ApiResponse<IAuthorizedUser>> {
    return this.http.get<ApiResponse<IAuthorizedUser>>(
      `${this.apiUrl}/email/${email}`,
      getAuthHeaders()
    );
  }

  public getUsersByRole(
    role: string
  ): Observable<ApiResponse<IAuthorizedUser[]>> {
    return this.http.get<ApiResponse<IAuthorizedUser[]>>(
      `${this.apiUrl}/role/${role}`,
      getAuthHeaders()
    );
  }

  public userExistsByEmail(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/exists/${email}`,
      getAuthHeaders()
    );
  }

  public getCurrentUser(): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(
      `${this.apiUrl}/me`,
      getAuthHeaders()
    );
  }

  public updateUserProfile(
    profileData: IUpdateUserProfile
  ): Observable<ApiResponse<IUser>> {
    return this.http.patch<ApiResponse<IUser>>(
      `${this.apiUrl}/me/profile`,
      profileData,
      getAuthHeaders()
    );
  }

  public updateUserAvatar(file: File): Observable<ApiResponse<IUser>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<IUser>>(
      `${this.apiUrl}/me/avatar`,
      formData,
      getAuthHeaders()
    );
  }

  public getUserProjects(
    userId: number
  ): Observable<ApiResponse<ProjectDTO[]>> {
    return this.http.get<ApiResponse<ProjectDTO[]>>(
      `${this.apiUrl}/${userId}/projects`,
      getAuthHeaders()
    );
  }

  public searchUsers(
    query: string,
    page: number = 0,
    size: number = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<IUser>> {
    return this.http.get<PageResponse<IUser>>(
      `${this.apiUrl}/search?query=${encodeURIComponent(
        query
      )}&page=${page}&size=${size}&sort=${sort}`,
      getAuthHeaders()
    );
  }

  getProjectsWithDetails(userId: number): Observable<ProjectDTO[]> {
    return this.getUserProjects(userId).pipe(
      switchMap((projects) => {
        return forkJoin(
          projects.data.map((project) => {
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

  getRecentlyActiveUsers(
    minutes: number = 50,
    count: number = 7
  ): Observable<ApiResponse<IUser[]>> {
    return this.http.get<ApiResponse<IUser[]>>(
      `${this.apiUrl}/recent-active-users?minutes=${minutes}&count=${count}`,
      getAuthHeaders()
    );
  }

  public getUserCollaborators(
    userId: number,
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<IUser>> {
    return this.http.get<PaginatedResponse<IUser>>(
      `${this.apiUrl}/${userId}/collaborators?page=${page}&size=${size}`,
      getAuthHeaders()
    );
  }

  // Delete User by ID
  public deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }
}
