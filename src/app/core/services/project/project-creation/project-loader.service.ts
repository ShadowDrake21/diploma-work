import { inject, Injectable } from '@angular/core';
import { ProjectDataService } from '../project-data/project-data.service';
import { ProjectFormService } from '../project-form/project-form.service';
import { ProjectService } from '../models/project.service';
import { ProjectType } from '@shared/enums/categories.enum';
import {
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { PublicationDTO } from '@models/publication.model';
import { PatentDTO } from '@models/patent.model';
import { ResearchDTO } from '@models/research.model';
import { NotificationService } from '@core/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectLoaderService {
  private readonly projectDataService = inject(ProjectDataService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);

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
        try {
          this.projectFormService.patchTypeForm(this.typeForm, project.type);
          this.typeForm.disable();

          this.projectFormService.patchGeneralInformationForm(
            this.generalInformationForm,
            { ...project, attachments: attachments || [] }
          );
        } catch (error) {
          this.handleFormError('Failed to patch form data', error);
          throw error;
        }
      }),
      map(({ project }) => project.type),
      switchMap((type: ProjectType) =>
        this.loadProjectTypeData(projectId, type).pipe(
          catchError((error) => {
            this.notificationService.showError(
              'Failed to load project type data'
            );
            return throwError(() => error);
          })
        )
      ),
      catchError((error) => {
        this.notificationService.showError('Failed to load project data');
        return throwError(() => error);
      })
    );
  }

  clearAllForms(): void {
    try {
      this.typeForm.reset();
      this.generalInformationForm.reset();
      this.publicationsForm.reset();
      this.patentsForm.reset();
      this.researchesForm.reset();
      this.typeForm.enable();
    } catch (error) {
      this.handleFormError('Failed to clear forms', error);
    }
  }

  private loadProjectTypeData(
    projectId: string,
    type: ProjectType
  ): Observable<any> {
    switch (type) {
      case ProjectType.PUBLICATION:
        return this.projectService.getPublicationByProjectId(projectId).pipe(
          tap((publication: PublicationDTO) => {
            try {
              this.projectFormService.patchSpecificForm(
                this.publicationsForm,
                publication,
                ProjectType.PUBLICATION
              );
            } catch (error) {
              this.handleFormError('Failed to patch publication form', error);
              throw error;
            }
          }),
          catchError((error) => {
            this.notificationService.showError(
              'Failed to load publication data'
            );
            return throwError(() => error);
          })
        );
      case ProjectType.PATENT:
        return this.projectService.getPatentByProjectId(projectId).pipe(
          tap((patent: PatentDTO) => {
            try {
              this.projectFormService.patchSpecificForm(
                this.patentsForm,
                patent,
                ProjectType.PATENT
              );
            } catch (error) {
              this.handleFormError('Failed to patch patent form', error);
              throw error;
            }
          }),
          catchError((error) => {
            this.notificationService.showError('Failed to load patent data');
            return throwError(() => error);
          })
        );
      case ProjectType.RESEARCH:
        return this.projectService.getResearchByProjectId(projectId).pipe(
          tap((research: ResearchDTO) => {
            try {
              this.projectFormService.patchSpecificForm(
                this.researchesForm,
                research,
                ProjectType.RESEARCH
              );
            } catch (error) {
              this.handleFormError('Failed to patch research form', error);
              throw error;
            }
          }),
          catchError((error) => {
            this.notificationService.showError('Failed to load research data');
            return throwError(() => error);
          })
        );
      default:
        return of(null);
    }
  }

  private handleFormError(message: string, error: any): void {
    console.error(message, error);
    this.notificationService.showError(message);
  }
}
