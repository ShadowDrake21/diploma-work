import { inject, Injectable } from '@angular/core';
import { CommentService } from '@core/services/comment.service';
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
  private commentService = inject(CommentService);
  private destroyed$ = new Subject<void>();

  // State
  private _comments = new BehaviorSubject<IComment[]>([]);
  private _commentsLoading = new BehaviorSubject<boolean>(false);

  // Public API
  comments$ = this._comments.asObservable();
  commentsLoading$ = this._commentsLoading.asObservable();

  private currentProjectId: string | null = null;

  setCurrentProjectId(projectId: string): void {
    this.currentProjectId = projectId;
  }

  refreshComments(projectId: string): void {
    this._commentsLoading.next(true);
    this.commentService
      .getCommentsByProjectId(projectId)
      .pipe(
        map((response) => this.transformComments(response.data)),
        catchError((error) => {
          console.error('Error fetching comments:', error);
          return of(this._comments.value);
        }),
        tap((comments) => this._comments.next(comments)),
        finalize(() => this._commentsLoading.next(false))
      )
      .subscribe();
  }

  postComment(comment: ICreateComment): Observable<IComment> {
    const currentUser = currentUserSig();
    if (!currentUser)
      return throwError(() => new Error('User not authenticated'));

    return this.commentService.createComment(comment).pipe(
      map((res) => res.data),
      tap(() => this.refreshComments(comment.projectId)),
      catchError((error) => {
        console.error('Error posting comment:', error);
        return throwError(() => error);
      })
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
      map((res) => res.data),
      tap(() => this.refreshComments(this.currentProjectId!)),
      catchError((error) => {
        console.error('Error updating comment:', error);
        throw error;
      })
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.commentService.deleteComment(commentId).pipe(
      map((res) => res.data),
      tap(() => this.refreshComments(this.currentProjectId!)),
      catchError((error) => {
        console.error('Error deleting comment:', error);
        throw error;
      })
    );
  }

  private transformComments(comments: IComment[]): IComment[] {
    const commentMap = new Map<string, IComment>();
    const rootComments: IComment[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach((comment) => {
      const commentCopy = commentMap.get(comment.id)!;
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        parent?.replies?.push(commentCopy);
      } else {
        rootComments.push(commentCopy);
      }
    });

    return rootComments;
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
      map((res) => res.data),
      catchError((err) => {
        this.updateCommentLikeState(commentId, !like); // Revert on error
        return throwError(() => err);
      })
    );
  }

  private updateCommentLikeState(commentId: string, isLiked: boolean): void {
    const currentComments = [...this._comments.value];
    const comment = this.findComment(currentComments, commentId);

    if (comment) {
      comment.likes += isLiked ? 1 : -1;
      comment.isLikedByCurrentUser = isLiked;
      this._comments.next(currentComments);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
