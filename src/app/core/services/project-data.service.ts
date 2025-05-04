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
import { forkJoin, Observable, of, switchMap } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService {
  private projectService = inject(ProjectService);
  private publicationService = inject(PublicationService);
  private patentService = inject(PatentService);
  private researchService = inject(ResearchService);
  private attachmentsService = inject(AttachmentsService);

  constructor() {}

  createProject(
    projectData: CreateProjectRequest,
    attachments: File[],
    formValues: {
      publication?: any;
      patent?: any;
      research?: any;
    }
  ): Observable<any> {
    return this.projectService.createProject(projectData).pipe(
      switchMap((projectResponse) => {
        const projectId = projectResponse.data.id;
        const operations = [
          this.handleTypedProjectCreation(
            projectId,
            projectData.type,
            formValues
          ),
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
    formValues: {
      publication?: any;
      patent?: any;
      research?: any;
    }
  ): Observable<any> {
    return this.projectService.updateProject(projectId, projectData).pipe(
      switchMap((projectResponse) => {
        const projectId = projectResponse.data.id;
        const operations = [
          this.handleTypedProjectUpdate(
            projectId,
            projectId,
            projectData.type!,
            formValues
          ),
        ];

        if (attachments.length > 0) {
          operations.push(
            this.attachmentsService.updateFiles(
              projectResponse.data.type as ProjectType,
              projectId,
              attachments
            )
          );
        }

        return forkJoin(operations);
      })
    );
  }

  private handleTypedProjectCreation(
    projectId: string,
    projectType: ProjectType,
    formValues: {
      publication?: any;
      patent?: any;
      research?: any;
    }
  ): Observable<any> {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        const publicationData = this.getPublicationFormValues(
          projectId,
          formValues.publication
        ) as CreatePublicationRequest;
        return this.publicationService.createPublication(publicationData);
      case ProjectType.PATENT:
        const patentData = this.getPatentFormValues(
          projectId,
          formValues.patent
        ) as CreatePatentRequest;
        return this.patentService.createPatent(patentData);
      case ProjectType.RESEARCH:
        const researchData = this.getResearchFormValues(
          projectId,
          formValues.research
        ) as CreateResearchRequest;
        return this.researchService.create(researchData);
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

  private handleTypedProjectUpdate(
    typedProjectId: string,
    projectId: string,
    projectType: ProjectType,
    formValues: {
      publication?: any;
      patent?: any;
      research?: any;
    }
  ): Observable<any> {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        const publicationData = {
          ...this.getPublicationFormValues(projectId, formValues.publication),
          id: typedProjectId,
        } as UpdatePublicationRequest;
        return this.publicationService.updatePublication(
          typedProjectId,
          publicationData
        );
      case ProjectType.PATENT:
        const patentData = {
          ...this.getPatentFormValues(projectId, formValues.patent),
          id: typedProjectId,
        } as UpdatePatentRequest;
        return this.patentService.updatePatent(typedProjectId, patentData);
      case ProjectType.RESEARCH:
        const researchData = {
          ...(this.getResearchFormValues(
            projectId,
            formValues.research
          ) as UpdateResearchRequest),
          id: typedProjectId,
        };
        return this.researchService.update(typedProjectId, researchData);
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

  private getPublicationFormValues(
    projectId: string,
    formValue: any
  ): CreatePublicationRequest | UpdatePublicationRequest {
    if (!formValue?.publicationDate) {
      throw new Error('Publication date is required');
    }
    const authors =
      formValue.authors?.map((author: string) => parseInt(author)) || [];

    return {
      projectId,
      publicationDate: new Date(formValue.publicationDate!).toISOString(),
      publicationSource: formValue.publicationSource ?? '',
      doiIsbn: formValue.doiIsbn ?? '',
      startPage: formValue.startPage ?? 1,
      endPage: formValue.endPage ?? 1,
      journalVolume: formValue.journalVolume ?? 1,
      issueNumber: formValue.issueNumber ?? 1,
      authors,
    };
  }

  private getPatentFormValues(
    projectId: string,
    formValue: any
  ): CreatePatentRequest | UpdatePatentRequest {
    if (!formValue?.primaryAuthor) {
      throw new Error('Primary author is required');
    }

    const primaryAuthorIdNumber = +formValue.primaryAuthor;
    const coInventorsNums =
      formValue.coInventors?.map((inventor: any) => +inventor) || [];

    const baseValues = {
      projectId,
      primaryAuthorId: primaryAuthorIdNumber,
      registrationNumber: formValue.registrationNumber ?? '',
      registrationDate:
        formValue.registrationDate?.toISOString() ?? new Date().toISOString(),
      issuingAuthority: formValue.issuingAuthority ?? '',
      coInventors: coInventorsNums,
    };

    return baseValues;
  }
  private getResearchFormValues(
    projectId: string,
    formValue: any
  ): CreateResearchRequest {
    return {
      projectId,
      participantIds: formValue.participants || [],
      budget: formValue.budget || 0,
      startDate: formValue.startDate?.toISOString() || new Date().toISOString(),
      endDate: formValue.endDate?.toISOString() || new Date().toISOString(),
      status: formValue.status || statuses[0].value,
      fundingSource: formValue.fundingSource || '',
    };
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
  ): Observable<any[]> {
    return this.attachmentsService.getFilesByEntity(projectType, projectId);
  }
}
