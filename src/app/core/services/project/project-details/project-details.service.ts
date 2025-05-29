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
import { IComment, ICommentUser, ICreateComment } from '@models/comment.types';
import { ProjectType } from '@shared/enums/categories.enum';
import { AuthService } from '@core/authentication/auth.service';
import { UserService } from '@core/services/users/user.service';
import { currentUserSig } from '@core/shared/shared-signals';

// COMMENTS!!!! (BUG FIXING)

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsService implements OnDestroy {
  private projectService = inject(ProjectService);
  private destroyed$ = new Subject<void>();
  private currentProjectId: string | null = null;

  // State
  private _project = new BehaviorSubject<ProjectDTO | undefined>(undefined);
  project$ = this._project.asObservable();

  constructor() {}

  loadProjectDetails(projectId: string): void {
    this.resetState();
    this.currentProjectId = projectId;

    this.projectService
      .getProjectById(projectId)
      .pipe(
        tap((project) => this._project.next(project.data)),
        catchError((error) => {
          console.error('Error loading project:', error);
          this._project.next(undefined);
          return of(undefined);
        })
      )
      .subscribe();
  }

  deleteProject(projectId: string): Observable<any> {
    return this.projectService.deleteProject(projectId);
  }

  resetState(): void {
    this._project.next(undefined);
    this.currentProjectId = null;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  getCurrentProjectType(): ProjectType | undefined {
    return this._project.value?.type;
  }
}
