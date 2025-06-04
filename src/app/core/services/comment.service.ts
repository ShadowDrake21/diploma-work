import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { PaginatedResponse } from '@models/api-response.model';
import { IComment, ICreateComment } from '@models/comment.types';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = BASE_URL + 'comments';

  getCommentsByProjectId(projectId: string): Observable<IComment[]> {
    return this.http
      .get<IComment[]>(`${this.apiUrl}/project/${projectId}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError(error, 'Failed to load comments')
        )
      );
  }

  createComment(comment: ICreateComment): Observable<IComment> {
    return this.http
      .post<IComment>(this.apiUrl, comment, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Comment created successfully')
        ),
        catchError((error) =>
          this.handleError(error, 'Failed to create comment')
        )
      );
  }

  updateComment(commentId: string, content: string): Observable<IComment> {
    return this.http
      .put<IComment>(`${this.apiUrl}/${commentId}`, content, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Comment updated successfully')
        ),
        catchError((error) =>
          this.handleError(error, 'Failed to update comment')
        )
      );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${commentId}`, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Comment deleted successfully')
        ),
        catchError((error) =>
          this.handleError(error, 'Failed to delete comment')
        )
      );
  }

  likeComment(commentId: string): Observable<IComment> {
    return this.http
      .post<IComment>(
        `${this.apiUrl}/${commentId}/like`,
        null,
        getAuthHeaders()
      )
      .pipe(
        tap(() => this.notificationService.showSuccess('Comment liked')),
        catchError((error) => this.handleError(error, 'Failed to like comment'))
      );
  }

  unlikeComment(commentId: string): Observable<IComment> {
    return this.http
      .delete<IComment>(`${this.apiUrl}/${commentId}/like`, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Removed like from comment')
        ),
        catchError((error) => this.handleError(error, 'Failed to remove like'))
      );
  }

  getCommentsByUserId(
    userId: number,
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<IComment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<PaginatedResponse<IComment>>(`${this.apiUrl}/user/${userId}`, {
        ...getAuthHeaders(),
        params,
      })
      .pipe(
        catchError((error) =>
          this.handleError(error, 'Failed to load user comments')
        )
      );
  }

  private handleError(error: any, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;

    if (error.status === 401) {
      errorMessage = 'Please log in to perform this action';
    } else if (error.status === 403) {
      errorMessage = 'You are not authorized for this action';
    } else if (error.status === 404) {
      errorMessage = 'Comment not found';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.notificationService.showError(errorMessage);
    console.error('CommentService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
