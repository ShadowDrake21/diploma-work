import { inject, Injectable } from '@angular/core';
import { ProjectService } from '../models/project.service';
import { AttachmentsService } from '../../attachments.service';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectWithAttachments } from '@shared/types/services/project-data.types';
import { NotificationService } from '@core/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataCoreService {
  protected readonly projectService = inject(ProjectService);
  protected readonly attachmentsService = inject(AttachmentsService);
  protected readonly notificationService = inject(NotificationService);

  getProjectById(projectId: string): Observable<ApiResponse<ProjectDTO>> {
    return this.projectService
      .getProjectById(projectId)
      .pipe(catchError((error) => this.handleProjectError(error, 'load')));
  }

  getAttachments(
    projectType: ProjectType,
    projectId: string
  ): Observable<FileMetadataDTO[]> {
    return this.attachmentsService
      .getFilesByEntity(projectType, projectId)
      .pipe(catchError((error) => this.handleAttachmentError(error, 'load')));
  }

  getProjectWithAttachments(
    projectId: string
  ): Observable<ProjectWithAttachments> {
    return this.getProjectById(projectId).pipe(
      switchMap((projectResponse) => {
        if (!projectResponse.data) {
          throw new Error('Project data not availabler');
        }

        return this.getAttachments(projectResponse.data!.type, projectId).pipe(
          map((attachments) => ({
            project: projectResponse.data!,
            attachments,
          })),
          catchError((error) => {
            this.notificationService.showError(
              'Project loaded but attachments failed to load'
            );

            return of({
              project: projectResponse.data!,
              attachments: [],
            });
          })
        );
      }),
      catchError((error) => {
        this.notificationService.showError(
          'Failed to load project with attachments'
        );
        return throwError(() => error);
      })
    );
  }
  protected handleProjectError(
    error: any,
    operation: string
  ): Observable<never> {
    const message = this.getProjectErrorMessage(error, operation);
    this.notificationService.showError(message);
    console.error(`Project ${operation} error:`, error);
    return throwError(() => error);
  }

  protected handleAttachmentError(
    error: any,
    operation: string
  ): Observable<never> {
    const message = `Failed to ${operation} project attachments`;
    this.notificationService.showError(message);
    console.error(`Attachment ${operation} error:`, error);
    return throwError(() => error);
  }

  protected getProjectErrorMessage(error: any, operation: string): string {
    if (error.status === 404) {
      return 'Project not found';
    }
    if (error.status === 403) {
      return 'You do not have permission to view this project';
    }
    return `Failed to ${operation} project`;
  }
}
