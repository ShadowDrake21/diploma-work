import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { IComment, ICreateComment } from '@models/comment.types';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'comments';

  getCommentsByProjectId(
    projectId: string
  ): Observable<ApiResponse<IComment[]>> {
    return this.http
      .get<ApiResponse<IComment[]>>(
        `${this.apiUrl}/project/${projectId}`,
        getAuthHeaders()
      )
      .pipe(catchError(this.handleError));
  }

  createComment(comment: ICreateComment): Observable<ApiResponse<IComment>> {
    return this.http
      .post<ApiResponse<IComment>>(this.apiUrl, comment, getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  updateComment(
    commentId: string,
    content: string
  ): Observable<ApiResponse<IComment>> {
    return this.http
      .put<ApiResponse<IComment>>(
        `${this.apiUrl}/${commentId}`,
        content,
        getAuthHeaders()
      )
      .pipe(catchError(this.handleError));
  }

  deleteComment(commentId: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(
        `${this.apiUrl}/${commentId}`,
        getAuthHeaders()
      )
      .pipe(catchError(this.handleError));
  }

  likeComment(commentId: string): Observable<ApiResponse<IComment>> {
    return this.http
      .post<ApiResponse<IComment>>(
        `${this.apiUrl}/${commentId}/like`,
        null,
        getAuthHeaders()
      )
      .pipe(catchError(this.handleError));
  }

  unlikeComment(commentId: string): Observable<ApiResponse<IComment>> {
    return this.http.delete<ApiResponse<IComment>>(
      `${this.apiUrl}/${commentId}/like`,
      getAuthHeaders()
    );
  }

  getCommentsByUserId(
    userId: number,
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<IComment>> {
    return this.http
      .get<PaginatedResponse<IComment>>(
        `${this.apiUrl}/user/${userId}?page=${page}&size=${size}`,
        getAuthHeaders()
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
