import { inject, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { statuses } from '@content/createProject.content';
import {
  CreateProjectRequest,
  ProjectDTO,
  UpdateProjectRequest,
} from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { BehaviorSubject, finalize, Observable, of, Subscription } from 'rxjs';
import { ProjectDataService } from './project-data.service';
import { UserService } from './user.service';
import { PublicationDTO } from '@models/publication.model';
import { PatentDTO } from '@models/patent.model';

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

  ngOnInit(): void {}

  constructor() {
    this.subscriptions.push(
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          if (user.id) {
            this.creatorId = +user.id;
            console.log('Creator ID set to:', this.creatorId);
          }
        },
        error: (err) => {
          console.error('Failed to get current user', err);
        },
      })
    );
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
      id: new FormControl<string | null>(null),
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
      id: new FormControl<string | null>(null),
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
      id: new FormControl<string | null>(null),
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
    console.log('buildProjectRequest', creatorId, generalInfoForm.value);
    const baseValues = {
      title: generalInfoForm.value.title ?? '',
      description: generalInfoForm.value.description ?? '',
      type: typeForm.value.type ?? ProjectType.PUBLICATION,
      progress: generalInfoForm.value.progress ?? 0,
      tagIds: generalInfoForm.value.tags ?? [],
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
    if (!form) return;

    form.patchValue({ type }, { emitEvent: false });

    form.disable({ emitEvent: false });
    form.markAsPristine();
    form.markAsUntouched();

    form.updateValueAndValidity();
  }
  patchGeneralInformationForm(form: FormGroup, project: any): void {
    const { title, description, progress, tagIds } = project;
    console.log('patchGeneralInformationForm', project);
    form.patchValue({
      title,
      description,
      progress,
      tags: tagIds,
    });
  }
  patchPublicationForm(form: FormGroup, publication: PublicationDTO): void {
    const {
      id,
      publicationDate,
      publicationSource,
      doiIsbn,
      startPage,
      endPage,
      journalVolume,
      issueNumber,
      authors,
    } = publication;

    console.log('patchPublicationForm', publication);

    form.patchValue({
      id,
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
    console.log('patchPatentForm', patent);
    const {
      id,
      primaryAuthorId,
      coInventors,
      registrationNumber,
      registrationDate,
      issuingAuthority,
    } = patent;

    form.patchValue({
      id,
      primaryAuthor: primaryAuthorId?.toString(),
      coInventors,
      registrationNumber,
      registrationDate: new Date(registrationDate),
      issuingAuthority,
    });
  }

  patchResearchForm(form: FormGroup, research: any): void {
    const {
      id,
      participants,
      budget,
      startDate,
      endDate,
      status,
      fundingSource,
    } = research;

    form.patchValue({
      id,
      participants: participants.map((p: any) => p.id.toString()),
      budget,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      fundingSource,
    });
  }
}
