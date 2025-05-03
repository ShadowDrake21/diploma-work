import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HeaderService } from '@core/services/header.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProjectTypeComponent } from './components/project-type/project-type.component';
import { ProjectGeneralInformationComponent } from './components/project-general-information/project-general-information.component';
import { ProjectPublicationFormComponent } from './components/project-publication-form/project-publication-form.component';
import { ProjectPatentFormComponent } from './components/project-patent-form/project-patent-form.component';
import { ProjectResearchFormComponent } from './components/project-research-form/project-research-form.component';
import { statuses, types } from '@content/createProject.content';
import { ProjectService } from '@core/services/project.service';
import { PatentService } from '@core/services/patent.service';
import { PublicationService } from '@core/services/publication.service';
import { ResearchService } from '@core/services/research.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { UserService } from '@core/services/user.service';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectType } from '@shared/enums/categories.enum';
import { ProjectSharedService } from '@core/services/project-shared.service';
import {
  CreatePatentRequest,
  PatentDTO,
  UpdatePatentRequest,
} from '@models/patent.model';
import {
  CreatePublicationRequest,
  PublicationDTO,
  UpdatePublicationRequest,
} from '@models/publication.model';
import {
  CreateProjectRequest,
  ProjectDTO,
  UpdateProjectRequest,
} from '@models/project.model';
import { IUser } from '@shared/types/users.types';
import {
  CreateResearchRequest,
  ResearchDTO,
  UpdateResearchRequest,
} from '@models/research.model';
import { ResponseUserDTO } from '@models/user.model';

@Component({
  selector: 'project-creation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    ProjectTypeComponent,
    ProjectGeneralInformationComponent,
    ProjectPublicationFormComponent,
    ProjectPatentFormComponent,
    ProjectResearchFormComponent,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
    provideNativeDateAdapter(),
  ],
  host: { style: 'display: block; height: 100%' },
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private userService = inject(UserService);
  private projectService = inject(ProjectService);
  private publicationService = inject(PublicationService);
  private patentService = inject(PatentService);
  private researchService = inject(ResearchService);
  private attachmentsService = inject(AttachmentsService);

  private projectSharedService = inject(ProjectSharedService);

  creatorId: number | null = null;
  projectId: string | null = null;

  authors: any[] = [];
  types = types;
  statuses = statuses;

  subtext: string =
    'Choose the type of record you want to create and provide the required details.';

  project$!: Observable<any | undefined>;
  typedProject$!: Observable<any | undefined>;
  allUsers$!: Observable<any[]>;
  updatingAttachments$!: Observable<any[]>;

  loading: boolean = false;

  typeForm = new FormGroup({
    type: new FormControl('', [Validators.required]),
  });
  generalInformationForm = new FormGroup({
    title: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    progress: new FormControl<number>(0, [
      Validators.min(0),
      Validators.max(100),
    ]),
    tags: new FormControl<string[]>([]),
    attachments: new FormControl<File[]>([]),
  });
  publicationsForm = new FormGroup({
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
  patentsForm = new FormGroup({
    primaryAuthor: new FormControl<string | null>(null, [Validators.required]),
    coInventors: new FormControl<number[]>([]),
    registrationNumber: new FormControl<string>(''),
    registrationDate: new FormControl<Date | null>(new Date()),
    issuingAuthority: new FormControl<string>(''),
  });
  researchForm = new FormGroup({
    participants: new FormControl<string[] | null>([], [Validators.required]),
    budget: new FormControl<number | null>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    startDate: new FormControl<Date | null>(new Date(), [Validators.required]),
    endDate: new FormControl<Date | null>(new Date(), [Validators.required]),
    status: new FormControl<string | null>(this.statuses[0].value, [
      Validators.required,
    ]),
    fundingSource: new FormControl<string>('', [Validators.required]),
  });

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.headerService.setTitle('Create New Entry');
    this.allUsers$ = this.userService.getAllUsers();
    this.projectId = this.route.snapshot.queryParamMap.get('id');

    this.subscriptions.push(
      this.userService.getCurrentUser().subscribe((user: IUser) => {
        this.creatorId = +user.id;
      })
    );

    if (this.projectId) {
      this.loadExistingProject();
    } else {
      this.projectSharedService.isProjectCreation = true;
    }
  }

  private loadExistingProject(): void {
    this.project$ = this.projectService.getProjectById(this.projectId!);

    this.typedProject$ = this.project$.pipe(
      switchMap((project) => {
        if (!project) return of(undefined);
        return this.loadTypedProject(project);
      })
    );

    this.subscriptions.push(
      this.project$.subscribe((project) => {
        if (!project) return;

        this.patchTypeForm(project.type);
        this.typeForm.disable();
        this.patchGeneralInformationForm(project);
        this.loadAttachments(project.type);

        switch (project.type) {
          case ProjectType.PUBLICATION:
            this.loadPublicationData();
            break;
          case ProjectType.PATENT:
            this.loadPatentData();
            break;
          case ProjectType.RESEARCH:
            this.loadResearchData();
            break;
        }
        this.projectSharedService.isProjectCreation = false;
      })
    );
  }

  private loadTypedProject(project: any): Observable<any> {
    switch (project.type) {
      case ProjectType.PUBLICATION:
        return this.projectService.getPublicationByProjectId(this.projectId!);
      case ProjectType.PATENT:
        return this.projectService.getPatentByProjectId(this.projectId!);
      case ProjectType.RESEARCH:
        return this.projectService.getResearchByProjectId(this.projectId!);
      default:
        return of(undefined);
    }
  }

  private loadAttachments(projectType: ProjectType): void {
    this.updatingAttachments$ = this.attachmentsService.getFilesByEntity(
      projectType,
      this.projectId!
    );
    this.subscriptions.push(
      this.updatingAttachments$.subscribe({
        next: (files) => {
          console.log('Fetched files:', files);
        },
        error: (error) => {
          console.error('Error fetching files:', error);
        },
      })
    );
  }

  private loadPublicationData(): void {
    this.subscriptions.push(
      this.projectService
        .getPublicationByProjectId(this.projectId!)
        .pipe(take(1))
        .subscribe({
          next: (publication) => {
            this.authors = publication.authors.map(
              (a: ResponseUserDTO) => a.id
            );
            this.patchPublicationForm(publication);
          },
          error: (error) => {
            console.error('Error loading publication:', error);
          },
        })
    );
  }

  private loadPatentData(): void {
    this.subscriptions.push(
      this.projectService
        .getPatentByProjectId(this.projectId!)
        .pipe(take(1))
        .subscribe({
          next: (patent) => {
            this.authors = patent.coInventors.map((coInventor: any) => {
              return coInventor.id;
            });
            this.patchPatentForm(patent);
          },
          error: (error) => {
            console.error('Error loading patent:', error);
          },
        })
    );
  }

  private loadResearchData(): void {
    this.subscriptions.push(
      this.projectService
        .getResearchByProjectId(this.projectId!)
        .pipe(take(1))
        .subscribe({
          next: (research) => {
            this.patchResearchForm(research);
          },
          error: (error) => {
            console.error('Error loading research:', error);
          },
        })
    );
  }

  // Form patching methods
  private patchTypeForm(type: ProjectType): void {
    this.typeForm.patchValue({
      type,
    });
  }

  private patchGeneralInformationForm(project: ProjectDTO): void {
    const { title, description, progress, tagIds } = project;

    this.generalInformationForm.patchValue({
      title,
      description,
      progress,
      tags: tagIds,
    });
  }

  private patchPublicationForm(publication: PublicationDTO): void {
    const {
      publicationDate,
      publicationSource,
      doiIsbn,
      startPage,
      endPage,
      journalVolume,
      issueNumber,
    } = publication;

    this.publicationsForm.patchValue({
      authors: this.authors,
      publicationDate: new Date(publicationDate),
      publicationSource,
      doiIsbn,
      startPage,
      endPage,
      journalVolume,
      issueNumber,
    });
  }

  private patchPatentForm(patent: PatentDTO): void {
    const {
      primaryAuthorId,
      coInventors,
      registrationNumber,
      registrationDate,
      issuingAuthority,
    } = patent;

    this.patentsForm.patchValue({
      primaryAuthor: primaryAuthorId?.toString(),
      coInventors: coInventors,
      registrationNumber: registrationNumber,
      registrationDate: new Date(registrationDate),
      issuingAuthority: issuingAuthority,
    });
  }

  private patchResearchForm(research: ResearchDTO): void {
    const { participants, budget, startDate, endDate, status, fundingSource } =
      research;

    this.researchForm.patchValue({
      participants: participants.map((p) => p.id + ''),
      budget: budget,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status,
      fundingSource: fundingSource,
    });
  }

  // Main form submission
  submitForm(): void {
    if (!this.validateForms()) return;

    this.loading = true;

    this.projectId ? this.updateProject() : this.createProject();
  }

  createProject() {
    const projectData = this.buildProjectRequest() as CreateProjectRequest;
    const attachments = this.generalInformationForm.value.attachments ?? [];

    this.projectService
      .createProject(projectData)
      .pipe(
        switchMap((projectResponse) => {
          const projectId = projectResponse.data.id;
          const operations = [
            this.handleTypedProjectCreation(projectId, projectData.type),
          ];

          if (attachments.length > 0) {
            operations.push(
              this.handleAttachments(attachments, projectData.type, projectId)
            );
          }
          return forkJoin(operations);
        })
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error),
      });
  }

  private updateProject(): void {
    if (!this.projectId) {
      console.error('Project ID is not defined');
      this.loading = false;
      return;
    }

    const projectData = this.buildProjectRequest() as UpdateProjectRequest;
    const attachments = this.generalInformationForm.value.attachments ?? [];

    this.projectService
      .updateProject(this.projectId, projectData)
      .pipe(
        switchMap((projectResponse) => {
          const operations = [
            this.handleTypedProjectUpdate(
              this.projectId!,
              this.projectId!,
              projectData.type!
            ),
          ];

          if (attachments.length > 0) {
            operations.push(
              this.attachmentsService.updateFiles(
                projectResponse.data.type as ProjectType,
                this.projectId!,
                attachments
              )
            );
          }

          return forkJoin(operations);
        })
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(): void {
    this.loading = false;
    this.router.navigate(['/projects', this.projectId]);
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.loading = false;
  }

  // Helper methods
  private validateForms(): boolean {
    if (!this.typeForm.valid || !this.generalInformationForm.valid) {
      this.typeForm.markAllAsTouched();
      this.generalInformationForm.markAllAsTouched();
      return false;
    }

    const projectType = this.typeForm.value.type as ProjectType;

    switch (projectType) {
      case ProjectType.PUBLICATION:
        if (!this.publicationsForm.valid) {
          this.publicationsForm.markAllAsTouched();
          return false;
        }
        break;
      case ProjectType.PATENT:
        if (!this.patentsForm.valid) {
          this.patentsForm.markAllAsTouched();
          return false;
        }
        break;
      case ProjectType.RESEARCH:
        if (!this.researchForm.valid) {
          this.researchForm.markAllAsTouched();
          return false;
        }
        break;
      default:
        console.error('Invalid project type');
        return false;
    }

    return true;
  }

  private buildProjectRequest(): CreateProjectRequest | UpdateProjectRequest {
    const baseRequest = {
      title: this.generalInformationForm.value.title ?? '',
      description: this.generalInformationForm.value.description ?? '',
      type: this.typeForm.value.type ?? ProjectType.PUBLICATION,
      progress: this.generalInformationForm.value.progress ?? 0,
      tagIds: this.generalInformationForm.value.tags ?? [],
      createdBy: this.creatorId ?? 0,
    };

    if (this.projectId) {
      return { ...baseRequest } as UpdateProjectRequest;
    }

    return {
      ...baseRequest,
      createdBy: this.creatorId || 0,
    } as CreateProjectRequest;
  }

  // Typed project handlers
  private handleTypedProjectCreation(
    projectId: string,
    projectType: ProjectType
  ): Observable<any> {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        const publicationData = this.getPublicationFormValues(
          projectId
        ) as CreatePublicationRequest;
        return this.publicationService.createPublication(publicationData);
      case ProjectType.PATENT:
        const patentData = this.getPatentFormValues(
          projectId
        ) as CreatePatentRequest;
        return this.patentService.createPatent(patentData);
      case ProjectType.RESEARCH:
        const researchData = this.getResearchFormValues(
          projectId
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
    projectType: ProjectType
  ): Observable<any> {
    switch (projectType) {
      case ProjectType.PUBLICATION:
        const publicationData = {
          ...this.getPublicationFormValues(projectId),
          id: typedProjectId,
        } as UpdatePublicationRequest;
        return this.publicationService.updatePublication(
          typedProjectId,
          publicationData
        );
      case ProjectType.PATENT:
        const patentData = {
          ...this.getPatentFormValues(projectId),
          id: typedProjectId,
        } as UpdatePatentRequest;
        return this.patentService.updatePatent(typedProjectId, patentData);
      case ProjectType.RESEARCH:
        const researchData = {
          ...(this.getResearchFormValues(projectId) as UpdateResearchRequest),
          id: typedProjectId,
        };
        return this.researchService.update(typedProjectId, researchData);
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

  // Form value getters
  private getPublicationFormValues(
    projectId: string
  ): CreatePublicationRequest | UpdatePublicationRequest {
    const formValue = this.publicationsForm.value;

    if (!formValue.publicationDate) {
      throw new Error('Publication date is required');
    }
    const authors =
      formValue.authors?.map((author: string) => parseInt(author)) || [];
    const baseValues = {
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
    return baseValues;
  }

  private getPatentFormValues(
    projectId: string
  ): CreatePatentRequest | UpdatePatentRequest {
    const formValue = this.patentsForm.value;
    const {
      primaryAuthor,
      coInventors,
      registrationNumber,
      registrationDate,
      issuingAuthority,
    } = formValue;

    if (!primaryAuthor) {
      throw new Error('Primary author is required');
    }

    const primaryAuthorIdNumber = +primaryAuthor;
    const coInventorsNums = coInventors?.map((inventor) => +inventor) || [];

    const baseValues = {
      projectId,
      primaryAuthorId: primaryAuthorIdNumber,
      registrationNumber: registrationNumber ?? '',
      registrationDate:
        registrationDate?.toISOString() ?? new Date().toISOString(),
      issuingAuthority: issuingAuthority ?? '',
      coInventors: coInventorsNums,
    };

    return baseValues;
  }
  private getResearchFormValues(projectId: string): CreateResearchRequest {
    const formValue = this.researchForm.value;

    return {
      projectId,
      participantIds: formValue.participants || [],
      budget: formValue.budget || 0,
      startDate: formValue.startDate?.toISOString() || new Date().toISOString(),
      endDate: formValue.endDate?.toISOString() || new Date().toISOString(),
      status: formValue.status || this.statuses[0].value,
      fundingSource: formValue.fundingSource || '',
    };
  }

  // Attachments handling

  private handleAttachments(
    files: File[],
    type: ProjectType,
    entityId: string
  ): Observable<any> {
    if (!files || files.length === 0) {
      console.error('No files to upload');
      return of(null);
    }
    const uploadObservables = files.map((file: File) =>
      this.attachmentsService.uploadFile(file, type, entityId).pipe(
        catchError((error) => {
          console.error('Error uploading attachment:', error);
          return of(null); // Handle the error and return an observable
        })
      )
    );

    return forkJoin(uploadObservables).pipe(
      tap((results) => {
        const successfulUploads = results.filter((result) => result !== null);
        console.log(`Successfully uploaded ${successfulUploads.length} files`);
      })
    );
  }

  // Cleanup
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
