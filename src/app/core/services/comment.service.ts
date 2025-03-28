import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import {
  CommentInterface,
  CreateCommentInterface,
} from '@shared/types/comment.types';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'comments';

  getCommentsByProjectId(projectId: string): Observable<CommentInterface[]> {
    return this.http.get<CommentInterface[]>(
      `${this.apiUrl}/project/${projectId}`,
      getAuthHeaders()
    );
  }

  createComment(comment: CreateCommentInterface): Observable<CommentInterface> {
    return this.http.post<CommentInterface>(
      this.apiUrl,
      comment,
      getAuthHeaders()
    );
  }

  updateComment(
    commentId: string,
    content: string
  ): Observable<CommentInterface> {
    return this.http.put<CommentInterface>(
      `${this.apiUrl}/${commentId}`,
      content,
      getAuthHeaders()
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${commentId}`,
      getAuthHeaders()
    );
  }

  likeComment(commentId: string): Observable<CommentInterface> {
    return this.http.post<CommentInterface>(
      `${this.apiUrl}/${commentId}/like`,
      null,
      getAuthHeaders()
    );
  }
}
