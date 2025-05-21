import { inject, Injectable } from '@angular/core';
import { ProjectDataService } from '../project-data/project-data.service';
import { ProjectFormService } from '../project-form/project-form.service';
import { ProjectService } from '../models/project.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';
import { PublicationDTO } from '@models/publication.model';
import { PatentDTO } from '@models/patent.model';
import { ResearchDTO } from '@models/research.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectLoaderService {
  private projectDataService = inject(ProjectDataService);
  private projectFormService = inject(ProjectFormService);
  private projectService = inject(ProjectService);

  // Forms
  typeForm = this.projectFormService.createTypeForm();
  generalInformationForm = this.projectFormService.createGeneralInfoForm();
  publicationsForm = this.projectFormService.createSpecificForm(
    ProjectType.PUBLICATION
  );
  patentsForm = this.projectFormService.createSpecificForm(ProjectType.PATENT);
  researchesForm = this.projectFormService.createSpecificForm(
    ProjectType.RESEARCH
  );

  loadProject(projectId: string): Observable<any> {
    return this.projectDataService.getProjectWithAttachments(projectId).pipe(
      tap(({ project, attachments }) => {
        this.projectFormService.patchTypeForm(this.typeForm, project.type);
        this.typeForm.disable();

        this.projectFormService.patchGeneralInformationForm(
          this.generalInformationForm,
          { ...project, attachments: attachments || [] }
        );

        return project;
      }),
      map(({ project }) => project.type),
      switchMap((type: ProjectType) =>
        this.loadProjectTypeData(projectId, type)
      )
    );
  }
  private loadProjectTypeData(
    projectId: string,
    type: ProjectType
  ): Observable<any> {
    switch (type) {
      case ProjectType.PUBLICATION:
        return this.projectService.getPublicationByProjectId(projectId).pipe(
          tap((publication: ApiResponse<PublicationDTO>) => {
            this.projectFormService.patchSpecificForm(
              this.publicationsForm,
              publication.data,
              ProjectType.PUBLICATION
            );
          })
        );
      case ProjectType.PATENT:
        return this.projectService.getPatentByProjectId(projectId).pipe(
          tap((patent: ApiResponse<PatentDTO>) => {
            this.projectFormService.patchSpecificForm(
              this.patentsForm,
              patent.data,
              ProjectType.PATENT
            );
          })
        );
      case ProjectType.RESEARCH:
        return this.projectService.getResearchByProjectId(projectId).pipe(
          tap((research: ApiResponse<ResearchDTO>) => {
            this.projectFormService.patchSpecificForm(
              this.researchesForm,
              research.data,
              ProjectType.RESEARCH
            );
          })
        );
      default:
        return of(null);
    }
  }
}
