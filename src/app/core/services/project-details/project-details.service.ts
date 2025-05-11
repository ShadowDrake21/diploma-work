import { inject, Injectable } from '@angular/core';
import { AttachmentsService } from '../attachments.service';
import { CommentService } from '../comment.service';
import { ProjectService } from '../project.service';
import { TagService } from '../tag.service';
import { ProjectDTO } from '@models/project.model';
import {
  CommentInterface,
  CreateCommentInterface,
} from '@shared/types/comment.types';
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
  tap,
} from 'rxjs';

// COMMENTS!!!! (BUG FIXING)

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsService {
  private projectService = inject(ProjectService);
  private attachmentsService = inject(AttachmentsService);
  private commentService = inject(CommentService);
  private tagService = inject(TagService);

  private commentActions$ = new Subject<'refresh'>();
  private _commentsLoading = new BehaviorSubject<boolean>(false);
  private _project = new BehaviorSubject<ProjectDTO | undefined>(undefined);
  project$ = this._project.asObservable();
  private _tags = new BehaviorSubject<any[]>([]);
  tags$ = this._tags.asObservable();

  private _attachments = new BehaviorSubject<any[]>([]);
  attachments$ = this._attachments.asObservable();

  publication$!: Observable<any>;
  patent$!: Observable<any>;
  research$!: Observable<any>;
  comments$!: Observable<CommentInterface[]>;
  commentsLoading$ = this._commentsLoading.asObservable();

  private currentProjectId: string | null = null;

  constructor() {
    this.comments$ = this.commentActions$.pipe(
      startWith('refresh'),
      switchMap(() => {
        if (!this.currentProjectId) return of([]);
        return this.commentService
          .getCommentsByProjectId(this.currentProjectId)
          .pipe(finalize(() => this._commentsLoading.next(false)));
      }),
      catchError((error) => {
        console.error('Error fetching comments:', error);
        return of([]);
      })
    );
  }

  loadProjectDetails(projectId: string): void {
    console.log('Loading project details for ID:', projectId);
    this.currentProjectId = projectId;
    this.project$ = this.projectService.getProjectById(projectId).pipe(
      map((res) => res.data),
      tap((project) => {
        if (project) {
          console.log('Project details loaded:', project);
          this._project.next(project);
          this.loadTags(project.tagIds);
          this.loadAttachments(project.type, project.id);
          this.loadSpecificProjectData(project.type, projectId);
        }
      }),
      catchError((error) => {
        console.error('Error loading project:', error);
        this._project.next(undefined);
        return of(undefined);
      })
    );

    this.project$.subscribe((project) => {
      console.log('Project details subscription triggered');
      console.log('Project details:', project);
    });
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

  private loadAttachments(type: string | undefined, projectId: string): void {
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
      catchError((error) => {
        console.error('Error fetching comments:', error);
        return of([]);
      })
    );
  }

  postComment(comment: CreateCommentInterface, callback?: () => void): void {
    this.commentService.createComment(comment).subscribe({
      next: () => {
        callback?.();
        this.commentActions$.next('refresh');
      },
      error: (error) => console.error('Error posting comment:', error),
    });
  }

  likeComment(commentId: string): Observable<CommentInterface> {
    return this.commentService.likeComment(commentId).pipe(
      tap((updatedComment) => {
        this.commentActions$.next('refresh');
        console.debug('Comment liked:', updatedComment);
      }),
      catchError((err) => {
        console.error('Error liking comment:', err);
        throw err;
      })
    );
  }

  updateComment(
    commentId: string,
    newContent: string
  ): Observable<CommentInterface> {
    return this.commentService.updateComment(commentId, newContent).pipe(
      tap((updatedComment) => {
        this.commentActions$.next('refresh');
        console.debug('Comment updated:', updatedComment);
      }),
      catchError((error) => {
        console.error('Error deleting comment:', error);
        throw error;
      })
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.commentService.deleteComment(commentId).pipe(
      tap(() => this.commentActions$.next('refresh')),
      catchError((error) => {
        console.error('Error deleting comment:', error);
        throw error;
      })
    );
  }

  deleteProject(projectId: string): Observable<any> {
    return this.projectService.deleteProject(projectId);
  }
}
