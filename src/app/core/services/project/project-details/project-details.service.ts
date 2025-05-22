import { inject, Injectable, OnDestroy } from '@angular/core';
import { AttachmentsService } from '../../attachments.service';
import { CommentService } from '../../comment.service';
import { ProjectService } from '../models/project.service';
import { TagService } from '../models/tag.service';
import { ProjectDTO } from '@models/project.model';

import {
  BehaviorSubject,
  catchError,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { IComment, ICreateComment } from '@shared/types/comment.types';
import { ProjectType } from '@shared/enums/categories.enum';

// COMMENTS!!!! (BUG FIXING)

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsService implements OnDestroy {
  private projectService = inject(ProjectService);
  private attachmentsService = inject(AttachmentsService);
  private commentService = inject(CommentService);
  private tagService = inject(TagService);

  private commentActions$ = new Subject<'refresh'>();
  private _commentsLoading = new BehaviorSubject<boolean>(false);

  private _project = new BehaviorSubject<ProjectDTO | undefined>(undefined);
  private _tags = new BehaviorSubject<any[]>([]);
  private _attachments = new BehaviorSubject<any[]>([]);
  private _comments = new BehaviorSubject<IComment[]>([]);

  project$ = this._project.asObservable();
  tags$ = this._tags.asObservable();
  attachments$ = this._attachments.asObservable();
  comments$ = this._comments.asObservable(); // Expose as observable
  commentsLoading$ = this._commentsLoading.asObservable();

  publication$: Observable<any> = of(null);
  patent$: Observable<any> = of(null);
  research$: Observable<any> = of(null);

  private destroyed$ = new Subject<void>();
  private currentProjectId: string | null = null;

  constructor() {
    this.commentActions$
      .pipe(
        startWith('refresh'),
        takeUntil(this.destroyed$),
        switchMap(() => {
          if (!this.currentProjectId) return of([]);
          this._commentsLoading.next(true);
          return this.commentService
            .getCommentsByProjectId(this.currentProjectId)
            .pipe(
              map((res) => res.data),
              catchError((error) => {
                console.error('Error fetching comments:', error);
                return of([]);
              }),
              finalize(() => this._commentsLoading.next(false))
            );
        })
      )
      .subscribe((comments) => {
        this._comments.next(comments);
      });
  }

  loadProjectDetails(projectId: string): void {
    this.resetState();
    console.log('Loading project details for ID:', projectId);
    this.currentProjectId = projectId;
    this.projectService
      .getProjectById(projectId)
      .pipe(
        tap((res) => {
          const project = res.data;
          this._project.next(project);

          if (project) {
            console.log('Project details loaded:', project);
            this._project.next(project);
            this.loadTags(project.tagIds);
            this.loadAttachments(project.type, project.id);
            this.loadSpecificProjectData(project.type, projectId);
            this.refreshComments();
          }
        }),
        catchError((error) => {
          console.error('Error loading project:', error);
          this._project.next(undefined);
          return of(undefined);
        })
      )
      .subscribe();
  }

  private loadTags(tagIds: string[] | undefined): void {
    const tags$ = tagIds
      ? forkJoin(tagIds.map((tagId) => this.tagService.getTagById(tagId)))
      : of([]);

    tags$.subscribe({
      next: (tags) => this._tags.next(tags),
      error: (err) => {
        console.error('Error loading tags:', err);
        this._tags.next([]);
      },
    });
  }

  private loadAttachments(
    type: ProjectType | undefined,
    projectId: string
  ): void {
    if (!type) {
      this._attachments.next([]);
      return;
    }

    this.attachmentsService
      .getFilesByEntity(type, projectId)
      .pipe(
        catchError((error) => {
          console.error('Error fetching attachments:', error);
          return of([]);
        })
      )
      .subscribe((attachments) => this._attachments.next(attachments));
  }

  private loadSpecificProjectData(
    type: string | undefined,
    projectId: string
  ): void {
    if (!type) return;

    switch (type) {
      case 'PUBLICATION':
        this.publication$ =
          this.projectService.getPublicationByProjectId(projectId);
        break;
      case 'PATENT':
        this.patent$ = this.projectService.getPatentByProjectId(projectId);
        break;
      case 'RESEARCH':
        this.research$ = this.projectService.getResearchByProjectId(projectId);
        break;
    }
  }

  loadComments(projectId: string) {
    this.comments$ = this.commentService.getCommentsByProjectId(projectId).pipe(
      map((res) => res.data),
      catchError((error) => {
        console.error('Error fetching comments:', error);
        return of([]);
      })
    );
  }

  postComment(comment: ICreateComment, callback?: () => void): void {
    this.commentService.createComment(comment).subscribe({
      next: () => {
        callback?.();
        this.refreshComments();
      },
      error: (error) => console.error('Error posting comment:', error),
    });
  }

  likeComment(commentId: string): Observable<IComment> {
    const currentComments = this._comments.value || [];
    const commentToUpdate = this.findCommentWithReplies(
      currentComments,
      commentId
    );

    if (commentToUpdate) {
      commentToUpdate.likes += 1;
      commentToUpdate.isLikedByCurrentUser = true;
      this._comments.next([...currentComments]);
    }

    return this.commentService.likeComment(commentId).pipe(
      map((res) => res.data),

      catchError((err) => {
        if (commentToUpdate) {
          commentToUpdate.likes = Math.max(0, commentToUpdate.likes - 1);
          commentToUpdate.isLikedByCurrentUser = false;
          this._comments.next([...currentComments]);
        }
        return throwError(() => err);
      })
    );
  }

  unlikeComment(commentId: string): Observable<IComment> {
    const currentComments = this._comments.value || [];
    const commentToUpdate = this.findCommentWithReplies(
      currentComments,
      commentId
    );

    if (commentToUpdate) {
      commentToUpdate.likes = Math.max(0, commentToUpdate.likes - 1);
      commentToUpdate.isLikedByCurrentUser = false;
      this._comments.next([...currentComments]);
    }

    return this.commentService.unlikeComment(commentId).pipe(
      map((res) => res.data),
      catchError((err) => {
        if (commentToUpdate) {
          commentToUpdate.likes += 1;
          commentToUpdate.isLikedByCurrentUser = true;
          this._comments.next([...currentComments]);
        }
        return throwError(() => err);
      })
    );
  }

  updateComment(commentId: string, newContent: string): Observable<IComment> {
    return this.commentService.updateComment(commentId, newContent).pipe(
      tap((updatedComment) => {
        this.refreshComments();
        console.debug('Comment updated:', updatedComment);
      }),
      map((res) => res.data),
      catchError((error) => {
        console.error('Error deleting comment:', error);
        throw error;
      })
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.commentService.deleteComment(commentId).pipe(
      tap(() => this.refreshComments()),
      map((res) => res.data),
      catchError((error) => {
        console.error('Error deleting comment:', error);
        throw error;
      })
    );
  }

  refreshComments(): void {
    this.commentActions$.next('refresh');
  }

  deleteProject(projectId: string): Observable<any> {
    return this.projectService.deleteProject(projectId);
  }

  resetState(): void {
    this._project.next(undefined);
    this._tags.next([]);
    this._attachments.next([]);
    this._comments.next([]);
    this.currentProjectId = null;
    this.publication$ = of(null);
    this.patent$ = of(null);
    this.research$ = of(null);
  }

  private findCommentWithReplies(
    comments: IComment[],
    commentId: string
  ): IComment | null {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) return comment;

    for (const c of comments) {
      if (c.replies) {
        const reply = c.replies.find((r) => r.id === commentId);
        if (reply) return reply;
      }
    }
    return null;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
