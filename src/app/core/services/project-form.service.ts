import { inject, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { statuses } from '@content/createProject.content';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { BehaviorSubject, finalize, Observable, of, Subscription } from 'rxjs';
import { ProjectDataService } from './project-data.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectFormService implements OnInit {
  private projectDataService = inject(ProjectDataService);
  private userService = inject(UserService);

  readonly statuses = statuses;
  loading = new BehaviorSubject<boolean>(false);
  isEditing = false;
  creatorId: number | null = null;
  existingFiles$: Observable<any[]> = of([]);
  allUsers$: Observable<any[]> = of([]);
  authors: any[] = [];

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const sub = this.userService.getCurrentUser().subscribe((user) => {
      this.creatorId = +user.id;
    });

    this.subscriptions.push(sub);
  }

  createTypeForm(): FormGroup {
    return new FormGroup({
      type: new FormControl<ProjectType | null>(null, [Validators.required]),
    });
  }

  createGeneralInfoForm(): FormGroup {
    return new FormGroup({
      title: new FormControl<string>('', [Validators.required]),
      description: new FormControl<string>('', [Validators.required]),
      progress: new FormControl<number>(0, [
        Validators.min(0),
        Validators.max(100),
      ]),
      tags: new FormControl<string[]>([]),
      attachments: new FormControl<File[]>([]),
    });
  }

  createPublicationForm(): FormGroup {
    return new FormGroup({
      authors: new FormControl<string[]>(['15', '16'], [Validators.required]),
      publicationDate: new FormControl<Date | null>(new Date(), [
        Validators.required,
      ]),
      publicationSource: new FormControl<string>('', [Validators.required]),
      doiIsbn: new FormControl<string>('', [Validators.required]),
      startPage: new FormControl<number>(1, [
        Validators.required,
        Validators.min(1),
      ]),
      endPage: new FormControl<number>(10, [
        Validators.required,
        Validators.min(1),
      ]),
      journalVolume: new FormControl<number>(1, [
        Validators.required,
        Validators.min(1),
      ]),
      issueNumber: new FormControl<number>(1, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  createPatentForm(): FormGroup {
    return new FormGroup({
      primaryAuthor: new FormControl<string | null>(null, [
        Validators.required,
      ]),
      coInventors: new FormControl<number[]>([]),
      registrationNumber: new FormControl<string>(''),
      registrationDate: new FormControl<Date | null>(new Date()),
      issuingAuthority: new FormControl<string>(''),
    });
  }

  createResearchForm(): FormGroup {
    return new FormGroup({
      participants: new FormControl<string[] | null>([], [Validators.required]),
      budget: new FormControl<number | null>(0, [
        Validators.required,
        Validators.min(0),
      ]),
      startDate: new FormControl<Date | null>(new Date(), [
        Validators.required,
      ]),
      endDate: new FormControl<Date | null>(new Date(), [Validators.required]),
      status: new FormControl<string | null>(this.statuses[0].value, [
        Validators.required,
      ]),
      fundingSource: new FormControl<string>('', [Validators.required]),
    });
  }

  private buildProjectRequest(
    typeForm: FormGroup,
    generalInfoForm: FormGroup,
    creatorId: number | null,
    isUpdate: boolean = false
  ): CreateProjectRequest | UpdateProjectRequest {
    const baseValues = {
      title: generalInfoForm.value.title ?? '',
      description: generalInfoForm.value.description ?? '',
      type: generalInfoForm.value.type ?? ProjectType.PUBLICATION,
      progress: generalInfoForm.value.progress ?? 0,
      tagsIds: generalInfoForm.value.tags ?? [],
      ...(!isUpdate && { createdBy: creatorId ?? 0 }),
    };

    return baseValues as CreateProjectRequest | UpdateProjectRequest;
  }

  submitForm(
    typeForm: FormGroup,
    generalInfoForm: FormGroup,
    workForm: FormGroup | null,
    projectId: string | null,
    creatorId: number | null,
    attachments: File[] = []
  ): Observable<{ projectId: string; type: ProjectType }> {
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

  private prepareFormValues(
    projectType: ProjectType,
    workFormValues: any
  ): { publication?: any; patent?: any; research?: any } {
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

  patchTypeForm(form: FormGroup, type: ProjectType) {
    form.patchValue({ type });
  }
  patchGeneralInformationForm(form: FormGroup, project: any): void {
    const { title, description, progress, tagIds } = project;
    form.patchValue({
      title,
      description,
      progress,
      tags: tagIds,
    });
  }
  patchPublicationForm(form: FormGroup, publication: any): void {
    const {
      publicationDate,
      publicationSource,
      doiIsbn,
      startPage,
      endPage,
      journalVolume,
      issueNumber,
      authors,
    } = publication;

    form.patchValue({
      authors: authors.map((a: any) => a.id.toString()),
      publicationDate: new Date(publicationDate),
      publicationSource,
      doiIsbn,
      startPage,
      endPage,
      journalVolume,
      issueNumber,
    });
  }

  patchPatentForm(form: FormGroup, patent: any): void {
    const {
      primaryAuthorId,
      coInventors,
      registrationNumber,
      registrationDate,
      issuingAuthority,
    } = patent;

    form.patchValue({
      primaryAuthor: primaryAuthorId?.toString(),
      coInventors: coInventors.map((c: any) => c.id),
      registrationNumber,
      registrationDate: new Date(registrationDate),
      issuingAuthority,
    });
  }

  patchResearchForm(form: FormGroup, research: any): void {
    const { participants, budget, startDate, endDate, status, fundingSource } =
      research;

    form.patchValue({
      participants: participants.map((p: any) => p.id.toString()),
      budget,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      fundingSource,
    });
  }
}
