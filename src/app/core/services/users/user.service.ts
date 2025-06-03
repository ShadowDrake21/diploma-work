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
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { ProjectService } from '../project/models/project.service';
import { ProjectDTO } from '@models/project.model';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = BASE_URL + 'users';

  private handleError<T>(operation: string, error: any): Observable<T> {
    console.error(`${operation} error:`, error);
    const message = this.getErrorMessage(operation, error);
    this.notificationService.showError(message);
    return throwError(() => error);
  }

  private getErrorMessage(operation: string, error: any): string {
    switch (operation) {
      case 'getCurrentUser':
        return 'Failed to load your user profile';
      case 'updateUserProfile':
      case 'updateUserAvatar':
        return 'Failed to update your profile';
      case 'deleteUser':
        return error.status === 403
          ? 'You do not have permission to delete users'
          : 'Failed to delete user';
      default:
        return error.status === 403
          ? 'You do not have permission to access this resource'
          : `Failed to ${operation.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }
  }

  public getPaginatedUsers(
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<PageResponse<IUser>> {
    return this.http
      .get<PageResponse<IUser>>(
        `${this.apiUrl}?page=${page}&size=${size}&sort=${sort}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<PageResponse<IUser>>('getPaginatedUsers', error)
        )
      );
  }

  public getAllUsers(): Observable<ApiResponse<IUser[]>> {
    return this.http
      .get<ApiResponse<IUser[]>>(`${this.apiUrl}/list`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IUser[]>>('getAllUsers', error)
        )
      );
  }

  public createUser(
    user: ICreateUser
  ): Observable<ApiResponse<IAuthorizedUser>> {
    return this.http
      .post<ApiResponse<IAuthorizedUser>>(this.apiUrl, user, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IAuthorizedUser>>('createUser', error)
        )
      );
  }

  public getUserById(id: number): Observable<ApiResponse<IAuthorizedUser>> {
    return this.http
      .get<ApiResponse<IAuthorizedUser>>(
        `${this.apiUrl}/${id}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IAuthorizedUser>>('getUserById', error)
        )
      );
  }

  public getFullUserById(id: number): Observable<ApiResponse<IUser>> {
    return this.http
      .get<ApiResponse<IUser>>(`${this.apiUrl}/${id}/info`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IUser>>('getFullUserById', error)
        )
      );
  }

  public getUserByEmail(
    email: string
  ): Observable<ApiResponse<IAuthorizedUser>> {
    return this.http
      .get<ApiResponse<IAuthorizedUser>>(
        `${this.apiUrl}/email/${email}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IAuthorizedUser>>(
            'getUserByEmail',
            error
          )
        )
      );
  }

  public getUsersByRole(
    role: string
  ): Observable<ApiResponse<IAuthorizedUser[]>> {
    return this.http
      .get<ApiResponse<IAuthorizedUser[]>>(
        `${this.apiUrl}/role/${role}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IAuthorizedUser[]>>(
            'getUsersByRole',
            error
          )
        )
      );
  }

  public userExistsByEmail(email: string): Observable<ApiResponse<boolean>> {
    return this.http
      .get<ApiResponse<boolean>>(
        `${this.apiUrl}/exists/${email}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<boolean>>('userExistsByEmail', error)
        )
      );
  }

  public getCurrentUser(): Observable<ApiResponse<IUser>> {
    return this.http
      .get<ApiResponse<IUser>>(`${this.apiUrl}/me`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IUser>>('getCurrentUser', error)
        )
      );
  }

  public updateUserProfile(
    profileData: IUpdateUserProfile
  ): Observable<ApiResponse<IUser>> {
    return this.http
      .patch<ApiResponse<IUser>>(
        `${this.apiUrl}/me/profile`,
        profileData,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IUser>>('updateUserProfile', error)
        )
      );
  }

  public updateUserAvatar(file: File): Observable<ApiResponse<IUser>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<IUser>>(
        `${this.apiUrl}/me/avatar`,
        formData,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) => {
          if (error.status === 413) {
            this.notificationService.showError('File size too large');
          } else if (error.status === 415) {
            this.notificationService.showError('Unsupported file type');
          }
          return this.handleError<ApiResponse<IUser>>(
            'updateUserAvatar',
            error
          );
        })
      );
  }

  public getUserProjects(
    userId: number
  ): Observable<ApiResponse<ProjectDTO[]>> {
    return this.http
      .get<ApiResponse<ProjectDTO[]>>(
        `${this.apiUrl}/${userId}/projects`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<ProjectDTO[]>>('getUserProjects', error)
        )
      );
  }

  public searchUsers(
    query: string,
    page: number = 0,
    size: number = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<IUser>> {
    return this.http
      .get<PageResponse<IUser>>(
        `${this.apiUrl}/search?query=${encodeURIComponent(
          query
        )}&page=${page}&size=${size}&sort=${sort}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<PageResponse<IUser>>('searchUsers', error)
        )
      );
  }

  getProjectsWithDetails(userId: number): Observable<ProjectDTO[]> {
    return this.getUserProjects(userId).pipe(
      switchMap((projects) => {
        if (!projects.data) return of([]);

        return forkJoin(
          projects.data!.map((project) => {
            let details$: Observable<any>;

            switch (project.type) {
              case ProjectType.PUBLICATION:
                details$ = this.projectService
                  .getPublicationByProjectId(project.id)
                  .pipe(catchError(() => of(null)));
                break;
              case ProjectType.PATENT:
                details$ = this.projectService
                  .getPatentByProjectId(project.id)
                  .pipe(catchError(() => of(null)));
                break;
              case ProjectType.RESEARCH:
                details$ = this.projectService
                  .getResearchByProjectId(project.id)
                  .pipe(catchError(() => of(null)));
                break;
              default:
                return of(project);
            }

            return details$.pipe(
              map((details) => ({
                ...project,
                ...(details?.data
                  ? { [project.type.toLowerCase()]: details.data }
                  : {}),
              }))
            );
          })
        );
      }),
      catchError((error) =>
        this.handleError<ProjectDTO[]>('getProjectsWithDetails', error)
      )
    );
  }

  getRecentlyActiveUsers(
    minutes: number = 50,
    count: number = 7
  ): Observable<ApiResponse<IUser[]>> {
    return this.http
      .get<ApiResponse<IUser[]>>(
        `${this.apiUrl}/recent-active-users?minutes=${minutes}&count=${count}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<IUser[]>>(
            'getRecentlyActiveUsers',
            error
          )
        )
      );
  }

  public getUserCollaborators(
    userId: number,
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<IUser>> {
    return this.http
      .get<PaginatedResponse<IUser>>(
        `${this.apiUrl}/${userId}/collaborators?page=${page}&size=${size}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<PaginatedResponse<IUser>>(
            'getUserCollaborators',
            error
          )
        )
      );
  }

  // Delete User by ID
  public deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<ApiResponse<void>>('deleteUser', error)
        )
      );
  }
}
