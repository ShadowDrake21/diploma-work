import { inject, Injectable } from '@angular/core';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@models/project.model';
import {
  catchError,
  forkJoin,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { ProjectDataCoreService } from './project-data-core.service';
import { PublicationDataService } from './publication-data.service';
import { PatentDataService } from './patent-data.service';
import { ResearchDataService } from './research-data.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService extends ProjectDataCoreService {
  private readonly publicationDataService = inject(PublicationDataService);
  private readonly patentDataService = inject(PatentDataService);
  private readonly researchDataService = inject(ResearchDataService);

  createProject(
    projectData: CreateProjectRequest,
    attachments: File[],
    formValues: TypedProjectFormValues
  ): Observable<any> {
    return this.projectService.createProject(projectData).pipe(
      switchMap((projectResponse) => {
        const operations = [
          this.createTypedProject(
            projectResponse,
            projectData.type,
            formValues
          ),
        ];

        if (attachments.length > 0) {
          operations.push(
            this.attachmentsService
              .uploadFiles(projectData.type, projectResponse, attachments)
              .pipe(
                catchError((error) =>
                  this.handleAttachmentError(error, 'upload')
                )
              )
          );
        }
        return forkJoin(operations).pipe(
          catchError((error) => {
            console.error('Transaction failed, rolling back', error);
            return this.rollbackCreate(projectResponse, error);
          })
        );
      }),
      catchError((error) => this.handleProjectError(error, 'create'))
    );
  }

  updateProject(
    projectId: string,
    projectData: UpdateProjectRequest,
    attachments: File[],
    formValues: TypedProjectFormValues
  ): Observable<any> {
    return this.projectService.getProjectById(projectId).pipe(
      switchMap((originalProject) => {
        return this.projectService.updateProject(projectId, projectData).pipe(
          switchMap(() => {
            if (
              !formValues.patent &&
              !formValues.publication &&
              !formValues.research
            ) {
              return of(null);
            }

            const operations = [
              this.updateTypedProject(projectId, projectData.type!, formValues),
            ];

            if (attachments.length > 0) {
              operations.push(
                this.attachmentsService
                  .updateFiles(
                    projectData.type as ProjectType,
                    projectId,
                    attachments
                  )
                  .pipe(
                    catchError((error) =>
                      this.handleAttachmentError(error, 'update')
                    )
                  )
              );
            }

            return forkJoin(operations).pipe(
              catchError((error) => {
                console.error('Transaction failed, rolling back', error);
                return this.rollbackUpdate(projectId, originalProject, error);
              })
            );
          }),
          catchError((error) => this.handleProjectError(error, 'update'))
        );
      }),
      catchError((error) => this.handleProjectError(error, 'fetch'))
    );
  }

  private createTypedProject(
    projectId: string,
    projectType: ProjectType,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        return this.publicationDataService.create(projectId, formValues);
      case ProjectType.PATENT:
        return this.patentDataService.create(projectId, formValues);
      case ProjectType.RESEARCH:
        return this.researchDataService.create(projectId, formValues);
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

  private updateTypedProject(
    projectId: string,
    projectType: ProjectType,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        return this.publicationDataService.update(projectId, formValues);
      case ProjectType.PATENT:
        return this.patentDataService.update(projectId, formValues);
      case ProjectType.RESEARCH:
        return this.researchDataService.update(projectId, formValues);
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

  private rollbackCreate(projectId: string, error: any): Observable<never> {
    this.notificationService.showError(
      'Failed to complete project creation. Rolling back...'
    );
    return this.projectService.deleteProject(projectId).pipe(
      switchMap(() => throwError(() => error)),
      catchError((rollbackError) => {
        console.error('Rollback failed:', rollbackError);
        return throwError(() => error);
      })
    );
  }

  private rollbackUpdate(
    projectId: string,
    originalData: any,
    error: any
  ): Observable<never> {
    this.notificationService.showError(
      'Failed to complete project update. Rolling back...'
    );
    return this.projectService
      .updateProject(projectId, {
        title: originalData.title,
        description: originalData.description,
        type: originalData.type,
        progress: originalData.progress,
        tagIds: originalData.tagIds,
      })
      .pipe(
        switchMap(() => throwError(() => error)),
        catchError((rollbackError) => {
          console.error('Rollback failed:', rollbackError);
          return throwError(() => error);
        })
      );
  }

  override handleProjectError(
    error: any,
    operation: string
  ): Observable<never> {
    const message = this.getProjectErrorMessage(operation, error);
    this.notificationService.showError(message);
    console.error(`Project ${operation} error:`, error);
    return throwError(() => error);
  }

  override handleAttachmentError(
    error: any,
    operation: string
  ): Observable<never> {
    const message =
      operation === 'upload'
        ? 'Failed to upload attachments'
        : 'Failed to update attachments';

    this.notificationService.showError(message);
    console.error(`Attachment ${operation} error:`, error);
    return throwError(() => error);
  }

  override getProjectErrorMessage(operation: string, error: any): string {
    switch (operation) {
      case 'create':
        return error.status === 409
          ? 'A project with this title already exists'
          : 'Failed to create project';
      case 'update':
        return error.status === 403
          ? 'You do not have permission to update this project'
          : 'Failed to update project';
      case 'fetch':
        return 'Failed to load project data';
      default:
        return 'An error occurred';
    }
  }
}
