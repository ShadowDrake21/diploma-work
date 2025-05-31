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
        const projectId = projectResponse.data!;
        const operations = [
          this.createTypedProject(projectId, projectData.type, formValues),
        ];

        if (attachments.length > 0) {
          operations.push(
            this.attachmentsService.uploadFiles(
              projectData.type,
              projectId,
              attachments
            )
          );
        }
        return forkJoin(operations).pipe(
          catchError((error) => {
            console.error('Transaction failed, rolling back', error);
            return this.projectService
              .deleteProject(projectId)
              .pipe(switchMap(() => throwError(() => error)));
          })
        );
      })
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
        const originalData = originalProject.data!;

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
                this.attachmentsService.updateFiles(
                  projectData.type as ProjectType,
                  projectId,
                  attachments
                )
              );
            }

            return forkJoin(operations).pipe(
              catchError((error) => {
                console.error('Transaction failed, rolling back', error);
                return this.projectService
                  .updateProject(projectId, {
                    title: originalData.title,
                    description: originalData.description,
                    type: originalData.type,
                    progress: originalData.progress,
                    tagIds: originalData.tagIds,
                  })
                  .pipe(switchMap(() => throwError(() => error)));
              })
            );
          })
        );
      })
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
}
