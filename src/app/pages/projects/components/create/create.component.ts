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
import { TagService } from '@core/services/tag.service';
import { UserService } from '@core/services/user.service';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectType } from '@shared/enums/categories.enum';
import { ProjectSharedService } from '@core/services/project-shared.service';
import { CreatePatentRequest, UpdatePatentRequest } from '@models/patent.model';

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

  projectId: string | null = null;
  project$!: Observable<any | undefined>;
  typedProject$!: Observable<any | undefined>;
  authors: any[] = [];

  subtext: string =
    'Choose the type of record you want to create and provide the required details.';

  types = types;
  statuses = statuses;

  allUsers$!: Observable<any[]>;
  updatingAttachments$!: Observable<any[]>;

  loading: boolean = false;

  typeForm = new FormGroup({
    type: new FormControl('', [Validators.required]),
  });
  generalInformationForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    progress: new FormControl(0, [Validators.min(0), Validators.max(100)]),
    tags: new FormControl(['']),
    attachments: new FormControl<File[]>([]),
  });
  publicationsForm = new FormGroup({
    authors: new FormControl(['15', '16'], [Validators.required]),
    publicationDate: new FormControl(new Date(), [Validators.required]),
    publicationSource: new FormControl('', [Validators.required]),
    doiIsbn: new FormControl('', [Validators.required]),
    startPage: new FormControl(10, [Validators.required]),
    endPage: new FormControl(20, [Validators.required]),
    journalVolume: new FormControl(1, [Validators.required]),
    issueNumber: new FormControl(1, [Validators.required]),
  });
  patentsForm = new FormGroup({
    primaryAuthor: new FormControl<string | null>(null, [Validators.required]),
    coInventors: new FormControl<number[]>([]),
    registrationNumber: new FormControl<string>(''),
    registrationDate: new FormControl<Date | null>(new Date()),
    issuingAuthority: new FormControl<string>(''),
  });
  researchProjects = new FormGroup({
    participants: new FormControl(['15', '16'], [Validators.required]),
    budget: new FormControl(0, [Validators.required]),
    startDate: new FormControl(new Date(), [Validators.required]),
    endDate: new FormControl(new Date(), [Validators.required]),
    status: new FormControl(this.statuses[0].value, [Validators.required]),
    fundingSource: new FormControl('', [Validators.required]),
  });

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.headerService.setTitle('Create New Entry');
    this.allUsers$ = this.userService.getAllUsers();
    this.projectId = this.route.snapshot.queryParamMap.get('id');

    if (this.projectId) {
      this.project$ = this.projectService.getProjectById(this.projectId);

      this.typedProject$ = this.project$.pipe(
        switchMap((project) => {
          if (!project) return of(undefined);

          if (project.type === 'PUBLICATION') {
            return this.projectService.getPublicationByProjectId(
              this.projectId!
            );
          } else if (project.type === 'PATENT') {
            return this.projectService.getPatentByProjectId(this.projectId!);
          } else if (project.type === 'RESEARCH') {
            return this.projectService.getResearchByProjectId(this.projectId!);
          } else {
            return of(undefined);
          }
        })
      );

      const sub = this.project$.subscribe((project) => {
        this.typeForm.patchValue({
          type: project?.type,
        });
        if (project) this.typeForm.disable();
        this.generalInformationForm.patchValue({
          title: project?.title,
          description: project?.description,
          progress: project?.progress,
          tags: project?.tagIds || [],
        });

        this.updatingAttachments$ = this.attachmentsService.getFilesByEntity(
          project.type,
          this.projectId!
        );
        this.attachmentsService
          .getFilesByEntity(project.type, this.projectId!)
          .subscribe({
            next: (files) => {
              console.log('Fetched files:', files);
              // Handle the files as needed, e.g., display them in the UI
            },
            error: (error) => {
              console.error('Error fetching files:', error);
            },
          });
        if (project?.type === 'PUBLICATION') {
          this.projectService
            .getPublicationByProjectId(this.projectId!)
            .subscribe((publication) => {
              this.authors = publication.authors.map((author: any) => {
                return author.id;
              });

              this.publicationsForm.patchValue({
                authors: publication.authors.map((author: any) =>
                  author.id.toString()
                ),
                publicationDate: new Date(publication.publicationDate),
                publicationSource: publication.publicationSource,
                doiIsbn: publication.doiIsbn,
                startPage: publication.startPage,
                endPage: publication.endPage,
                journalVolume: publication.journalVolume,
                issueNumber: publication.issueNumber,
              });
            });
        }
        if (project?.type === 'PATENT') {
          this.projectService
            .getPatentByProjectId(this.projectId!)
            .subscribe((patent) => {
              this.authors = patent.coInventors.map((coInventor: any) => {
                return coInventor.id;
              });
              this.patentsForm.patchValue({
                primaryAuthor: patent.primaryAuthorId?.toString(),
                coInventors: patent.coInventors,
                registrationNumber: patent.registrationNumber,
                registrationDate: new Date(patent.registrationDate),
                issuingAuthority: patent.issuingAuthority,
              });
            });
        }
        if (project?.type === 'RESEARCH') {
          const sub = this.projectService
            .getResearchByProjectId(this.projectId!)
            .subscribe((research) => {
              console.log('Research:', research);
              console.log(
                'budget, fundingSource',
                research.budget,
                research.fundingSource
              );
              this.researchProjects.patchValue({
                participants: research.participantIds,
                budget: research.budget,
                startDate: new Date(research.startDate),
                endDate: new Date(research.endDate),
                status: research.status,
                fundingSource: research.fundingSource,
              });
            });
        }
        this.projectSharedService.isProjectCreation = false;
      });

      this.subscriptions.push(sub);
    } else {
      this.projectSharedService.isProjectCreation = true;
    }
  }

  saveDraft() {
    console.log('Draft saved');
  }

  submitForm() {
    const attachments = this.generalInformationForm.value.attachments;

    if (attachments && attachments.length > 0) {
      console.log('Attachments uploaded:', attachments);
    }

    if (this.projectId) {
      this.updateProject();
      return;
    } else {
      this.createProject();
    }

    this.loading = true;

    const selectedType = this.typeForm.value.type;
    const availableTypes = this.types.map((type) => type.value);
    const tags = this.generalInformationForm.value.tags;

    console.log('Selected type:', selectedType);
    console.log('Tags:', tags);

    const createProjecySub = this.projectService
      .createProject({
        title: this.generalInformationForm.value.title,
        description: this.generalInformationForm.value.description,
        type: selectedType,
        progress: this.generalInformationForm.value.progress,
        tagIds: tags,
      })
      .subscribe((response) => {
        const projectId = response.id;

        if (attachments && attachments.length > 0) {
          attachments.forEach((file: File) => {
            this.attachmentsService
              .uploadFile(file, selectedType as ProjectType, projectId)
              .subscribe({
                next: (response) => {
                  console.log('Attachment uploaded:', response);
                  this.loading = false;
                  this.router.navigate(['/projects']);
                },

                error: (error) => {
                  this.loading = false;
                  console.error('Error uploading attachment:', error);
                },
              });
          });
        }

        if (selectedType === availableTypes[0]) {
          const authors = this.publicationsForm.value.authors?.map(
            (author: string) => parseInt(author)
          );
          console.log('Authors:', authors);
          this.publicationService
            .createPublication({
              projectId,
              ...this.publicationsForm.value,
              authors,
              publicationDate: new Date(
                this.publicationsForm.value.publicationDate!
              ).toISOString(),
            })
            .subscribe((response) =>
              console.log('Publication created:', response)
            );

          // PUBLICATION UPDATE ERRORS
        }

        if (selectedType === availableTypes[1]) {
          const coInventors = this.patentsForm.value.coInventors ?? [];
          const primaryAuthorId = this.patentsForm.value.primaryAuthor;

          if (!primaryAuthorId) {
            console.error('Primary author is required');
            return;
          }

          const patentData = this.getPatentFormValues(
            projectId
          ) as CreatePatentRequest;
          const patentSub = this.patentService
            .createPatent(patentData)
            .subscribe((response) => console.log('Patent created:', response));
          this.subscriptions.push(patentSub);
          this.loading = false;
        }
        if (selectedType === availableTypes[2]) {
          const participants = this.researchProjects.value.participants?.map(
            (participant: string) => parseInt(participant)
          );

          console.log('Participants:', participants);
          this.researchService
            .createResearch({
              projectId,
              ...this.researchProjects.value,
              startDate: new Date(
                this.researchProjects.value.startDate!
              ).toISOString(),
              endDate: new Date(
                this.researchProjects.value.endDate!
              ).toISOString(),
              participantIds: participants,
              status: this.researchProjects.value.status!,
            })
            .subscribe((response) =>
              console.log('Research created:', response)
            );
        }
      });

    this.subscriptions.push(createProjecySub);
  }

  createProject() {
    console.log('Project created');
  }

  updateProject() {
    const projectId = this.projectId;

    if (!projectId) {
      console.error('Project ID is not defined');
      return;
    }

    const tags = this.generalInformationForm.value.tags;
    const attachments = this.generalInformationForm.value.attachments || [];
    this.loading = true;

    const updateProjectSub = this.projectService
      .updateProject(projectId, {
        title: this.generalInformationForm.value.title,
        description: this.generalInformationForm.value.description,
        progress: this.generalInformationForm.value.progress,
        tagIds: tags,
        type: this.typeForm.value.type,
      })
      .subscribe((projectResponse) => {
        console.log('Project updated:', projectResponse);

        const selectedType = this.typeForm.value.type;

        if (attachments.length > 0) {
          const updateAttachmentsSub = this.attachmentsService
            .updateFiles(selectedType as ProjectType, projectId, attachments)
            .subscribe({
              next: (response) => {
                console.log('Files updated:', response);
                this.loading = false;
                this.router.navigate(['/projects']);
              },
              error: (error) => {
                console.error('Error updating files:', error);
                this.loading = false;
              },
            });

          this.subscriptions.push(updateAttachmentsSub);
        }

        const typedSub = this.typedProject$.subscribe((typedProject) => {
          if (!typedProject) {
            console.error('Typed project is not defined');
            return;
          }
          if (selectedType === 'PUBLICATION') {
            console.log('publication updating');
            const publicationAuthors = this.publicationsForm.value.authors?.map(
              (author: string) => ({
                user: {
                  id: parseInt(author),
                },
              })
            );
            const updatePublicationSub = this.publicationService
              .updatePublication(typedProject.id, {
                project: { id: this.projectId },
                publicationAuthors,
                publicationDate: new Date(
                  this.publicationsForm.value.publicationDate!
                ).toISOString(),
                publicationSource:
                  this.publicationsForm.value.publicationSource,
                doiIsbn: this.publicationsForm.value.doiIsbn,
                startPage: this.publicationsForm.value.startPage,
                endPage: this.publicationsForm.value.endPage,
                journalVolume: this.publicationsForm.value.journalVolume,
                issueNumber: this.publicationsForm.value.issueNumber,
              })
              .subscribe({
                next: (publicationResponse) =>
                  console.log('Publication updated:', publicationResponse),
                error: (error) =>
                  console.error('Error updating publication:', error),
              });

            this.subscriptions.push(updatePublicationSub);
          } else if (selectedType === 'PATENT') {
            try {
              if (!this.projectId) {
                throw new Error('Project ID is required');
              }

              const patentData = {
                ...this.getPatentFormValues(this.projectId),
                id: typedProject.id,
              } as UpdatePatentRequest;
              const updatePatentSub = this.patentService
                .updatePatent(typedProject.id, patentData)
                .subscribe({
                  next: (patentResponse) =>
                    console.log('Patent updated:', patentResponse),
                  error: (error) =>
                    console.error('Error updating patent:', error),
                });

              this.subscriptions.push(updatePatentSub);
            } catch (error) {
              console.error('Error updating patent:', error);
              this.loading = false;
            }
          } else if (selectedType === 'RESEARCH') {
            const participants = this.researchProjects.value.participants?.map(
              (participant: string) => parseInt(participant)
            );
            const updateResearchSub = this.researchService
              .updateResearch(typedProject.id, {
                projectId: this.projectId,
                participantIds: participants,
                budget: this.researchProjects.value.budget,
                startDate: new Date(
                  this.researchProjects.value.startDate!
                ).toISOString(),
                endDate: new Date(
                  this.researchProjects.value.endDate!
                ).toISOString(),
                status: this.researchProjects.value.status!,
                fundingSource: this.researchProjects.value.fundingSource,
              })
              .subscribe({
                next: (researchResponse) =>
                  console.log('Research updated:', researchResponse),
                error: (error) =>
                  console.error('Error updating research:', error),
              });
            this.subscriptions.push(updateResearchSub);
          }
        });

        this.subscriptions.push(typedSub);
      });

    this.subscriptions.push(updateProjectSub);
  }

  private getPatentFormValues(
    projectId: string
  ): CreatePatentRequest | UpdatePatentRequest {
    const formValue = this.patentsForm.value;
    const primaryAuthorId = formValue.primaryAuthor;

    if (!primaryAuthorId) {
      throw new Error('Primary author is required');
    }

    const primaryAuthorIdNumber = +primaryAuthorId;

    const baseValues = {
      projectId,
      primaryAuthorId: primaryAuthorIdNumber,
      registrationNumber: formValue.registrationNumber ?? '',
      registrationDate:
        formValue.registrationDate?.toISOString() ?? new Date().toISOString(),
      issuingAuthority: formValue.issuingAuthority ?? '',
      coInventors: formValue.coInventors ?? [],
    };

    return baseValues;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
