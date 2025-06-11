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
          this.handleError(error, 'Не вдалося завантажити коментарі')
        )
      );
  }

  createComment(comment: ICreateComment): Observable<IComment> {
    return this.http
      .post<IComment>(this.apiUrl, comment, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Коментар успішно створено')
        ),
        catchError((error) =>
          this.handleError(error, 'Не вдалося створити коментар')
        )
      );
  }

  updateComment(commentId: string, content: string): Observable<IComment> {
    return this.http
      .put<IComment>(`${this.apiUrl}/${commentId}`, content, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Коментар успішно оновлено')
        ),
        catchError((error) =>
          this.handleError(error, 'Не вдалося оновити коментар')
        )
      );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${commentId}`, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Коментар успішно видалено')
        ),
        catchError((error) =>
          this.handleError(error, 'Не вдалося видалити коментар')
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
        tap(() => this.notificationService.showSuccess('Коментар лайкнутий')),
        catchError((error) =>
          this.handleError(error, 'Не вдалося лайкнути коментар')
        )
      );
  }

  unlikeComment(commentId: string): Observable<IComment> {
    return this.http
      .delete<IComment>(`${this.apiUrl}/${commentId}/like`, getAuthHeaders())
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('Знято лайк з коментаря')
        ),
        catchError((error) =>
          this.handleError(error, 'Не вдалося зняти лайк з коментаря')
        )
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
          this.handleError(
            error,
            'Не вдалося завантажити коментарі користувача'
          )
        )
      );
  }

  private handleError(error: any, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;

    if (error.status === 401) {
      errorMessage = 'Будь ласка, увійдіть, щоб виконати цю дію';
    } else if (error.status === 403) {
      errorMessage = 'Ви не маєте дозволу на цю дію';
    } else if (error.status === 404) {
      errorMessage = 'Коментар не знайдено';
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
