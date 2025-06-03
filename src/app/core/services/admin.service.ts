import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { PatentDTO } from '@models/patent.model';
import { ProjectResponse, ProjectWithDetails } from '@models/project.model';
import { PublicationDTO } from '@models/publication.model';
import { ResearchDTO } from '@models/research.model';
import { IUser } from '@models/user.model';

import { IComment } from '@models/comment.types';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { UserLogin } from '@models/user-login.model';
import { SortingDirection } from '@shared/enums/sorting.enum';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = BASE_URL + 'admin';

  projects = signal<ProjectResponse[]>([]);
  publications = signal<PublicationDTO[]>([]);
  patents = signal<PatentDTO[]>([]);
  researches = signal<ResearchDTO[]>([]);
  comments = signal<IComment[]>([]);

  projectsPagination = signal({ page: 0, size: 10, total: 0 });
  publicationsPagination = signal({ page: 0, size: 10, total: 0 });
  patentsPagination = signal({ page: 0, size: 10, total: 0 });
  researchesPagination = signal({ page: 0, size: 10, total: 0 });
  commentsPagination = signal({ page: 0, size: 10, total: 0 });

  loading = signal(false);
  error = signal<string | null>(null);

  private handleError<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      this.error.set(this.getErrorMessage(error, operation));
      this.notificationService.showError(this.error()!);
      this.loading.set(false);
      return of(result as T);
    };
  }

  private getErrorMessage(error: any, operation: string): string {
    if (error.status === 403) {
      return 'You do not have permission to perform this action';
    }
    if (error.status === 404) {
      return 'The requested resource was not found';
    }
    return `Failed to ${operation}. Please try again.`;
  }

  getAllUsers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    direction: SortingDirection = SortingDirection.ASC
  ): Observable<PaginatedResponse<IUser>> {
    this.loading.set(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http
      .get<PaginatedResponse<IUser>>(`${this.apiUrl}/users`, {
        params,
      })
      .pipe(
        catchError(this.handleError<PaginatedResponse<IUser>>('load users')),
        finalize(() => this.loading.set(false))
      );
  }

  promoteToAdmin(userId: number): Observable<ApiResponse<IUser>> {
    this.loading.set(true);
    return this.http
      .post<ApiResponse<IUser>>(`${this.apiUrl}/users/${userId}/promote`, {})
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('User promoted to admin')
        ),
        catchError(this.handleError<ApiResponse<IUser>>('promote user')),
        finalize(() => this.loading.set(false))
      );
  }

  demoteFromAdmin(userId: number): Observable<ApiResponse<IUser>> {
    this.loading.set(true);
    return this.http
      .post<ApiResponse<IUser>>(`${this.apiUrl}/users/${userId}/demote`, {})
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('User demoted from admin')
        ),
        catchError(this.handleError<ApiResponse<IUser>>('demote user')),
        finalize(() => this.loading.set(false))
      );
  }

  deactivateUser(userId: number): Observable<ApiResponse<void>> {
    this.loading.set(true);
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/users/${userId}/deactivate`, {})
      .pipe(
        tap(() => this.notificationService.showSuccess('User deactivated')),
        catchError(this.handleError<ApiResponse<void>>('deactivate user')),
        finalize(() => this.loading.set(false))
      );
  }

  deleteUser(userId: number): Observable<ApiResponse<void>> {
    this.loading.set(true);
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        tap(() => this.notificationService.showSuccess('User deleted')),
        catchError(this.handleError<ApiResponse<void>>('delete user')),
        finalize(() => this.loading.set(false))
      );
  }

  reactivateUser(userId: number): Observable<ApiResponse<void>> {
    this.loading.set(true);
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/users/${userId}/reactivate`, {})
      .pipe(
        tap(() => this.notificationService.showSuccess('User reactivated')),
        catchError(this.handleError<ApiResponse<void>>('reactivate user')),
        finalize(() => this.loading.set(false))
      );
  }

  getProjectsWithDetails(
    page: number = 0,
    pageSize: number = 10
  ): Observable<PaginatedResponse<ProjectWithDetails>> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http
      .get<PaginatedResponse<ProjectWithDetails>>(
        `${this.apiUrl}/with-details`,
        {
          ...getAuthHeaders(),
          params,
        }
      )
      .pipe(
        catchError(
          this.handleError<PaginatedResponse<ProjectWithDetails>>(
            'load projects with details'
          )
        ),
        finalize(() => this.loading.set(false))
      );
  }

  loadAllProjects(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<ProjectResponse>> {
    this.loading.set(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<PaginatedResponse<ProjectResponse>>(`${this.apiUrl}/projects`, {
        params,
      })
      .pipe(
        tap((response) => {
          this.projects.set(response.data!);
          this.projectsPagination.set({
            page,
            size,
            total: response.totalItems,
          });
        }),
        catchError(
          this.handleError<PaginatedResponse<ProjectResponse>>('load projects')
        ),
        finalize(() => this.loading.set(false))
      );
  }

  loadAllComments(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<IComment>> {
    this.loading.set(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<PaginatedResponse<IComment>>(`${this.apiUrl}/comments`, {
        params,
      })
      .pipe(
        tap((response) => {
          this.comments.set(response.data!);
          this.commentsPagination.set({
            page,
            size,
            total: response.totalItems,
          });
        }),
        catchError(
          this.handleError<PaginatedResponse<IComment>>('load comments')
        ),
        finalize(() => this.loading.set(false))
      );
  }

  deleteComment(commentId: string): Observable<ApiResponse<void>> {
    this.loading.set(true);
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/comments/${commentId}`)
      .pipe(
        tap(() => this.notificationService.showSuccess('Comment deleted')),
        catchError(this.handleError<ApiResponse<void>>('delete comment')),
        finalize(() => this.loading.set(false))
      );
  }

  getRecentLogins(count: number = 10): Observable<ApiResponse<UserLogin[]>> {
    this.loading.set(true);
    return this.http
      .get<ApiResponse<UserLogin[]>>(
        `${this.apiUrl}/recent-logins?count=${count}`,
        getAuthHeaders()
      )
      .pipe(
        catchError(
          this.handleError<ApiResponse<UserLogin[]>>('load recent logins')
        ),
        finalize(() => this.loading.set(false))
      );
  }

  getLoginStats(hours: number = 24): Observable<ApiResponse<number>> {
    this.loading.set(true);
    return this.http
      .get<ApiResponse<number>>(
        `${this.apiUrl}/login-stats?hours=${hours}`,
        getAuthHeaders()
      )
      .pipe(
        catchError(this.handleError<ApiResponse<number>>('load login stats')),
        finalize(() => this.loading.set(false))
      );
  }

  resetState(): void {
    this.projects.set([]);
    this.publications.set([]);
    this.patents.set([]);
    this.researches.set([]);
    this.comments.set([]);
    this.error.set(null);
  }
}
