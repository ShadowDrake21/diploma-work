import { inject, Injectable } from '@angular/core';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@models/project.model';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { ProjectDataCoreService } from './project-data/project-data-core.service';
import { PublicationDataService } from './project-data/publication-data.service';
import { PatentDataService } from './project-data/patent-data.service';
import { ResearchDataService } from './project-data/research-data.service';

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
        const projectId = projectResponse.data;
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
        return forkJoin(operations);
      })
    );
  }

  updateProject(
    projectId: string,
    projectData: UpdateProjectRequest,
    attachments: File[],
    formValues: TypedProjectFormValues
  ): Observable<any> {
    return this.projectService.updateProject(projectId, projectData).pipe(
      switchMap((projectResponse) => {
        // const projectId = projectResponse.data;
        const typedProjectId = this.getTypedProjectId(
          projectData.type!,
          formValues
        );
        const operations = [
          this.updateTypedProject(
            typedProjectId,
            // projectId,
            projectData.type!,
            formValues
          ),
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

        return forkJoin(operations);
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

  private getTypedProjectId(
    projectType: ProjectType,
    formValues: TypedProjectFormValues
  ): string {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        return formValues.publication?.id;
      case ProjectType.PATENT:
        return formValues.patent?.id;
      case ProjectType.RESEARCH:
        return formValues.research?.id;
      default:
        return '';
    }
  }
}
