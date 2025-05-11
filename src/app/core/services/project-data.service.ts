import { inject, Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { PublicationService } from './publication.service';
import { PatentService } from './patent.service';
import { ResearchService } from './research.service';
import { AttachmentsService } from './attachments.service';
import {
  CreateProjectRequest,
  ProjectDTO,
  UpdateProjectRequest,
} from '@models/project.model';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import {
  CreatePublicationRequest,
  UpdatePublicationRequest,
} from '@models/publication.model';
import { CreatePatentRequest, UpdatePatentRequest } from '@models/patent.model';
import {
  CreateResearchRequest,
  UpdateResearchRequest,
} from '@models/research.model';
import { statuses } from '@content/createProject.content';
import { ApiResponse } from '@models/api-response.model';
import { FileMetadataDTO } from '@models/file.model';
import {
  ProjectWithAttachments,
  TypedProjectFormValues,
} from '@shared/types/services/project-data.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService {
  private readonly projectService = inject(ProjectService);
  private readonly publicationService = inject(PublicationService);
  private readonly patentService = inject(PatentService);
  private readonly researchService = inject(ResearchService);
  private readonly attachmentsService = inject(AttachmentsService);

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
        console.log('Project updated:', projectData);
        const projectId = projectResponse.data;
        const typedProjectId = this.getTypedProjectId(
          projectData.type!,
          formValues
        );
        const operations = [
          this.updateTypedProject(
            typedProjectId,
            projectId,
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
        return this.publicationService.createPublication(
          this.buildPublicationCreateRequest(projectId, formValues.publication)
        );
      case ProjectType.PATENT:
        return this.patentService.createPatent(
          this.buildPatentCreateRequest(projectId, formValues.patent)
        );
      case ProjectType.RESEARCH:
        return this.researchService.create(
          this.buildResearchCreateRequest(projectId, formValues.research)
        );
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

  private updateTypedProject(
    typedProjectId: string,
    projectId: string,
    projectType: ProjectType,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        return this.publicationService.updatePublication(
          typedProjectId,
          this.buildPublicationUpdateRequest(
            projectId,
            formValues.publication,
            typedProjectId
          )
        );
      case ProjectType.PATENT:
        return this.patentService.updatePatent(
          typedProjectId,
          this.buildPatentUpdateRequest(
            projectId,
            formValues.patent,
            typedProjectId
          )
        );
      case ProjectType.RESEARCH:
        return this.researchService.update(
          typedProjectId,
          this.buildResearchUpdateRequest(
            projectId,
            formValues.research,
            typedProjectId
          )
        );
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

  private buildPublicationCreateRequest(
    projectId: string,
    formValue: any,
    id?: string
  ): CreatePublicationRequest {
    if (!formValue?.publicationDate) {
      throw new Error('Publication date is required');
    }

    return {
      projectId,
      publicationDate: new Date(formValue.publicationDate!).toISOString(),
      publicationSource: formValue.publicationSource ?? '',
      doiIsbn: formValue.doiIsbn ?? '',
      startPage: formValue.startPage ?? 1,
      endPage: formValue.endPage ?? 1,
      journalVolume: formValue.journalVolume ?? 1,
      issueNumber: formValue.issueNumber ?? 1,
      authors:
        formValue.authors?.map((author: string) => parseInt(author)) || [],
    };
  }

  private buildPublicationUpdateRequest(
    projectId: string,
    formValue: any,
    id: string
  ): UpdatePublicationRequest {
    const baseRequest = this.buildPublicationCreateRequest(
      projectId,
      formValue
    );
    return { ...baseRequest, id };
  }

  private buildPatentCreateRequest(
    projectId: string,
    formValue: any
  ): CreatePatentRequest | UpdatePatentRequest {
    if (!formValue?.primaryAuthor) {
      throw new Error('Primary author is required');
    }

    return {
      projectId,
      primaryAuthorId: +formValue.primaryAuthor,
      registrationNumber: formValue.registrationNumber ?? '',
      registrationDate:
        formValue.registrationDate?.toISOString() ?? new Date().toISOString(),
      issuingAuthority: formValue.issuingAuthority ?? '',
      coInventors:
        formValue.coInventors?.map((inventor: any) => +inventor) || [],
    };
  }

  private buildPatentUpdateRequest(
    projectId: string,
    formValue: any,
    id: string
  ): UpdatePatentRequest {
    const baseRequest = this.buildPatentCreateRequest(projectId, formValue);
    return { ...baseRequest, id };
  }

  private buildResearchCreateRequest(
    projectId: string,
    formValue: any
  ): CreateResearchRequest {
    return {
      projectId,
      participantIds: formValue.participantIds || [],
      budget: formValue.budget || 0,
      startDate: formValue.startDate?.toISOString() || new Date().toISOString(),
      endDate: formValue.endDate?.toISOString() || new Date().toISOString(),
      status: formValue.status || statuses[0].value,
      fundingSource: formValue.fundingSource || '',
    };
  }

  private buildResearchUpdateRequest(
    projectId: string,
    formValue: any,
    id: string
  ): UpdateResearchRequest {
    const baseRequest = this.buildResearchCreateRequest(projectId, formValue);
    return { ...baseRequest, id };
  }

  getProjectById(projectId: string): Observable<ApiResponse<ProjectDTO>> {
    return this.projectService.getProjectById(projectId);
  }

  getPublicationByProjectId(projectId: string): Observable<any> {
    return this.projectService.getPublicationByProjectId(projectId);
  }

  getPatentByProjectId(projectId: string): Observable<any> {
    return this.projectService.getPatentByProjectId(projectId);
  }

  getResearchByProjectId(projectId: string): Observable<any> {
    return this.projectService.getResearchByProjectId(projectId);
  }

  getAttachments(
    projectType: ProjectType,
    projectId: string
  ): Observable<FileMetadataDTO[]> {
    return this.attachmentsService.getFilesByEntity(projectType, projectId);
  }

  getProjectWithAttachments(
    projectId: string
  ): Observable<ProjectWithAttachments> {
    return this.getProjectById(projectId).pipe(
      switchMap((projectResponse) => {
        return this.getAttachments(projectResponse.data.type, projectId).pipe(
          map((attachments) => ({
            project: projectResponse.data,
            attachments,
          }))
        );
      })
    );
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
