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
  ParticipantDTO,
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
import { PaginatedResponse } from '@models/api-response.model';
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

  public getAllUsers(): Observable<IUser[]> {
    return this.http
      .get<IUser[]>(`${this.apiUrl}/list`, getAuthHeaders())
      .pipe(
        catchError((error) => this.handleError<IUser[]>('getAllUsers', error))
      );
  }

  public createUser(user: ICreateUser): Observable<IAuthorizedUser> {
    return this.http
      .post<IAuthorizedUser>(this.apiUrl, user, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<IAuthorizedUser>('createUser', error)
        )
      );
  }

  public getUserById(id: number): Observable<ParticipantDTO> {
    return this.http
      .get<ParticipantDTO>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<ParticipantDTO>('getUserById', error)
        )
      );
  }

  public getFullUserById(id: number): Observable<IUser> {
    return this.http
      .get<IUser>(`${this.apiUrl}/${id}/info`, getAuthHeaders())
      .pipe(
        catchError((error) => this.handleError<IUser>('getFullUserById', error))
      );
  }

  public getUserByEmail(email: string): Observable<IAuthorizedUser> {
    return this.http
      .get<IAuthorizedUser>(`${this.apiUrl}/email/${email}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<IAuthorizedUser>('getUserByEmail', error)
        )
      );
  }

  public getUsersByRole(role: string): Observable<IAuthorizedUser[]> {
    return this.http
      .get<IAuthorizedUser[]>(`${this.apiUrl}/role/${role}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<IAuthorizedUser[]>('getUsersByRole', error)
        )
      );
  }

  public userExistsByEmail(email: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.apiUrl}/exists/${email}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<boolean>('userExistsByEmail', error)
        )
      );
  }

  public getCurrentUser(): Observable<IUser> {
    return this.http
      .get<IUser>(`${this.apiUrl}/me`, getAuthHeaders())
      .pipe(
        catchError((error) => this.handleError<IUser>('getCurrentUser', error))
      );
  }

  public updateUserProfile(profileData: IUpdateUserProfile): Observable<IUser> {
    return this.http
      .patch<IUser>(`${this.apiUrl}/me/profile`, profileData, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<IUser>('updateUserProfile', error)
        )
      );
  }

  public updateUserAvatar(file: File): Observable<IUser> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http
      .post<IUser>(`${this.apiUrl}/me/avatar`, formData, getAuthHeaders())
      .pipe(
        catchError((error) => {
          if (error.status === 413) {
            this.notificationService.showError('File size too large');
          } else if (error.status === 415) {
            this.notificationService.showError('Unsupported file type');
          }
          return this.handleError<IUser>('updateUserAvatar', error);
        })
      );
  }

  public getUserProjects(userId: number): Observable<ProjectDTO[]> {
    return this.http
      .get<ProjectDTO[]>(`${this.apiUrl}/${userId}/projects`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError<ProjectDTO[]>('getUserProjects', error)
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
        if (!projects) return of([]);

        return forkJoin(
          projects.map((project) => {
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
                ...(details ? { [project.type.toLowerCase()]: details } : {}),
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
  ): Observable<IUser[]> {
    return this.http
      .get<IUser[]>(
        `${this.apiUrl}/recent-active-users?minutes=${minutes}&count=${count}`,
        getAuthHeaders()
      )
      .pipe(
        catchError((error) =>
          this.handleError<IUser[]>('getRecentlyActiveUsers', error)
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
  public deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(catchError((error) => this.handleError<void>('deleteUser', error)));
  }
}
