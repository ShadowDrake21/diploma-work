import { inject, Injectable } from '@angular/core';
import { ProjectService } from '../models/project.service';
import { AttachmentsService } from '../../attachments.service';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
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

  getProjectById(projectId: string): Observable<ProjectDTO> {
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
      .pipe(catchError((error) => this.handleAttachmentError(error, 'додати')));
  }

  getProjectWithAttachments(
    projectId: string
  ): Observable<ProjectWithAttachments> {
    return this.getProjectById(projectId).pipe(
      switchMap((projectResponse) => {
        return this.getAttachments(projectResponse.type, projectId).pipe(
          map((attachments) => ({
            project: projectResponse,
            attachments,
          })),
          catchError((error) => {
            this.notificationService.showError(
              'Проєкт завантажено, але додатки не вдалося завантажити'
            );

            return of({
              project: projectResponse,
              attachments: [],
            });
          })
        );
      }),
      catchError((error) => {
        this.notificationService.showError(
          'Не вдалося завантажити проєкт із вкладеннями'
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
    const message = `Не вдалося ${operation} вкладення до проекту`;
    this.notificationService.showError(message);
    console.error(`Attachment ${operation} error:`, error);
    return throwError(() => error);
  }

  protected getProjectErrorMessage(error: any, operation: string): string {
    if (error.status === 404) {
      return 'Проєкт не знайдено';
    }
    if (error.status === 403) {
      return 'У вас немає дозволу на перегляд цього проєкту';
    }
    return `Не вдалося ${operation} проєкт`;
  }
}
