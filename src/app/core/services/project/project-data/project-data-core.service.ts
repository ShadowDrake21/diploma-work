import { inject, Injectable } from '@angular/core';
import { ProjectService } from '../models/project.service';
import { AttachmentsService } from '../../attachments.service';
import { map, Observable, switchMap } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectWithAttachments } from '@shared/types/services/project-data.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataCoreService {
  protected readonly projectService = inject(ProjectService);
  protected readonly attachmentsService = inject(AttachmentsService);

  getProjectById(projectId: string): Observable<ApiResponse<ProjectDTO>> {
    return this.projectService.getProjectById(projectId);
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
        return this.getAttachments(projectResponse.data!.type, projectId).pipe(
          map((attachments) => ({
            project: projectResponse.data!,
            attachments,
          }))
        );
      })
    );
  }
}
