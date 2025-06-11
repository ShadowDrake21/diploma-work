import { inject, Injectable } from '@angular/core';
import { CommentService } from '@core/services/comment.service';
import { NotificationService } from '@core/services/notification.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { IComment, ICreateComment } from '@models/comment.types';
import {
  Subject,
  BehaviorSubject,
  map,
  catchError,
  of,
  tap,
  finalize,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectCommentService {
  private readonly commentService = inject(CommentService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyed$ = new Subject<void>();

  private _comments = new BehaviorSubject<IComment[]>([]);
  private _loading = new BehaviorSubject<boolean>(false);

  comments$ = this._comments.asObservable();
  loading = this._loading.asObservable();

  private currentProjectId: string | null = null;

  setCurrentProjectId(projectId: string): void {
    this.currentProjectId = projectId;
  }

  refreshComments(projectId: string): void {
    this._loading.next(true);
    this.commentService
      .getCommentsByProjectId(projectId)
      .pipe(
        tap({
          next: (comments) => {
            this._comments.next(comments);
            this._loading.next(false);
          },
          error: (error) => {
            this._loading.next(false);
            this.notificationService.showError(
              'Не вдалося завантажити коментарі'
            );
            console.error('Error fetching comments:', error);
          },
        }),
        catchError(() => of(this._comments.value)),
        finalize(() => this._loading.next(false))
      )
      .subscribe();
  }

  postComment(comment: ICreateComment): Observable<IComment> {
    const currentUser = currentUserSig();
    if (!currentUser) {
      this.notificationService.showError(
        'Будь ласка, увійдіть, щоб залишити коментар'
      );
      return throwError(() => new Error('Користувач не автентифіковано'));
    }

    return this.commentService.createComment(comment).pipe(
      tap({
        next: () => {
          this.refreshComments(comment.projectId);
          this.notificationService.showSuccess('Коментар успішно опубліковано');
        },
        error: (error) => {
          this.notificationService.showError(
            'Не вдалося опублікувати коментар'
          );
          console.error('Error posting comment:', error);
        },
      }),
      catchError((error) => throwError(() => error))
    );
  }

  likeComment(commentId: string): Observable<IComment> {
    return this.toggleCommentLike(commentId, true);
  }

  unlikeComment(commentId: string): Observable<IComment> {
    return this.toggleCommentLike(commentId, false);
  }

  updateComment(commentId: string, newContent: string): Observable<IComment> {
    return this.commentService.updateComment(commentId, newContent).pipe(
      tap({
        next: () => {
          this.refreshComments(this.currentProjectId!);
          this.notificationService.showSuccess('Коментар успішно оновлено');
        },
        error: (error) => {
          this.notificationService.showError('Не вдалося оновити коментар');
          console.error('Error updating comment:', error);
        },
      }),
      catchError((error) => throwError(() => error))
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.commentService.deleteComment(commentId).pipe(
      tap({
        next: () => {
          this.refreshComments(this.currentProjectId!);
          this.notificationService.showSuccess('Коментар успішно видалено');
        },
        error: (error) => {
          this.notificationService.showError('Не вдалося видалити коментар');
          console.error('Error deleting comment:', error);
        },
      }),
      catchError((error) => throwError(() => error))
    );
  }

  private findComment(
    comments: IComment[],
    commentId: string
  ): IComment | null {
    for (const comment of comments) {
      if (comment.id === commentId) return comment;
      if (comment.replies) {
        const found = this.findComment(comment.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  }

  private toggleCommentLike(
    commentId: string,
    like: boolean
  ): Observable<IComment> {
    const serviceCall = like
      ? this.commentService.likeComment(commentId)
      : this.commentService.unlikeComment(commentId);

    this.updateCommentLikeState(commentId, like);

    return serviceCall.pipe(
      tap({
        error: (err) => {
          this.updateCommentLikeState(commentId, !like);
          this.notificationService.showError(
            like ? 'Не вдалося поставити "лайк"' : 'Не вдалося прибрати "лайк"'
          );
          console.error('Error toggling comment like:', err);
        },
      }),
      catchError((error) => throwError(() => error))
    );
  }

  private updateCommentLikeState(commentId: string, isLiked: boolean): void {
    const currentComments = [...this._comments.value];
    const comment = this.findComment(currentComments, commentId);

    if (comment) {
      comment.likes += isLiked ? 1 : -1;
      comment.likedByCurrentUser = isLiked;
      this._comments.next(currentComments);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
