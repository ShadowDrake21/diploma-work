import { inject, Injectable, OnDestroy } from '@angular/core';
import { ProjectService } from '../models/project.service';
import { ProjectDTO } from '@models/project.model';

import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import { NotificationService } from '@core/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsService implements OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private destroyed$ = new Subject<void>();
  private currentProjectId: string | null = null;

  private _project = new BehaviorSubject<ProjectDTO | null>(null);
  project$ = this._project.asObservable();

  loadProjectDetails(projectId: string): void {
    this.resetState();
    this.currentProjectId = projectId;

    this.projectService
      .getProjectById(projectId)
      .pipe(
        takeUntil(this.destroyed$),
        catchError(() => {
          this._project.next(null);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this._project.next(response);
        } else {
          this._project.next(null);
        }
      });
  }

  deleteProject(projectId: string): Observable<any> {
    return this.projectService.deleteProject(projectId).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Project deleted successfully');
          this.resetState();
        },
        error: (error) => {
          console.error('Error deleting project:', error);
          this.notificationService.showError(
            error.status === 403
              ? 'You do not have permission to delete this project'
              : 'Failed to delete project'
          );
        },
      })
    );
  }

  resetState(): void {
    this._project.next(null);
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
