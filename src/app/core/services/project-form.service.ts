import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { finalize, Observable } from 'rxjs';
import { ProjectDataService } from './project-data.service';
import { UserService } from './user.service';
import { PublicationDTO } from '@models/publication.model';
import { PatentDTO } from '@models/patent.model';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { PatentFormService } from './project-form/patent-form.service';
import { ProjectFormCoreService } from './project-form/project-form-core.service';
import { PublicationFormService } from './project-form/publication-form.service';
import { ResearchFormService } from './project-form/research-form.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectFormService extends ProjectFormCoreService {
  private readonly projectDataService = inject(ProjectDataService);
  private readonly userService = inject(UserService);
  private readonly publicationFormService = inject(PublicationFormService);
  private readonly patentFormService = inject(PatentFormService);
  private readonly researchFormService = inject(ResearchFormService);

  constructor() {
    super();
    this.subscriptions.push(
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          if (user.id) {
            this.creatorId = +user.id;
          }
        },
        error: (err) => {
          console.error('Failed to get current user', err);
        },
      })
    );
  }

  createSpecificForm(type: ProjectType): FormGroup {
    switch (type) {
      case ProjectType.PUBLICATION:
        return this.publicationFormService.createForm();
      case ProjectType.PATENT:
        return this.patentFormService.createForm();
      case ProjectType.RESEARCH:
        return this.researchFormService.createForm();
      default:
        throw new Error('Invalid project type');
    }
  }

  patchSpecificForm(
    form: FormGroup,
    data: any,
    projectType: ProjectType
  ): void {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        this.publicationFormService.patchForm(form, data);
        break;
      case ProjectType.PATENT:
        this.patentFormService.patchForm(form, data);
        break;
      case ProjectType.RESEARCH:
        this.researchFormService.patchForm(form, data);
        break;
      default:
        throw new Error('Invalid project type');
    }
  }

  submitForm(
    typeForm: FormGroup,
    generalInfoForm: FormGroup,
    workForm: FormGroup | null,
    projectId: string | null,
    creatorId: number | null,
    attachments: File[] = []
  ): Observable<PublicationDTO[] | PatentDTO[] | PatentDTO[]> {
    this.loading.next(true);

    const formValues = this.prepareFormValues(
      typeForm.value.type,
      workForm?.value
    );

    const projectData = this.buildProjectRequest(
      typeForm,
      generalInfoForm,
      creatorId,
      !!projectId
    );

    const operation = projectId
      ? this.projectDataService.updateProject(
          projectId,
          projectData as UpdateProjectRequest,
          attachments,
          formValues
        )
      : this.projectDataService.createProject(
          projectData as CreateProjectRequest,
          attachments,
          formValues
        );
    return operation.pipe(finalize(() => this.loading.next(false)));
  }

  private buildProjectRequest(
    typeForm: FormGroup,
    generalInfoForm: FormGroup,
    creatorId: number | null,
    isUpdate: boolean = false
  ): CreateProjectRequest | UpdateProjectRequest {
    return {
      title: generalInfoForm.value.title ?? '',
      description: generalInfoForm.value.description ?? '',
      type: typeForm.value.type ?? ProjectType.PUBLICATION,
      progress: generalInfoForm.value.progress ?? 0,
      tagIds: generalInfoForm.value.tags ?? [],
      ...(!isUpdate && { createdBy: creatorId ?? 0 }),
    };
  }

  private prepareFormValues(
    projectType: ProjectType,
    workFormValues: any
  ): TypedProjectFormValues {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        return { publication: workFormValues };
      case ProjectType.PATENT:
        return { patent: workFormValues };
      case ProjectType.RESEARCH:
        return { research: workFormValues };
      default:
        return {};
    }
  }
}
