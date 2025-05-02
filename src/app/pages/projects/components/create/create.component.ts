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
import { CreatePatentRequest, UpdatePatentRequest } from '@models/patent.model';
import {
  CreatePublicationRequest,
  ResponseUserDTO,
  UpdatePublicationRequest,
} from '@models/publication.model';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@models/project.model';
import { IUser } from '@shared/types/users.types';

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
    this.userService.getCurrentUser().subscribe((user: IUser) => {
      this.creatorId = +user.id;
    });

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
              this.authors = publication.authors.map(
                (author: ResponseUserDTO) => {
                  return author.id;
                }
              );

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

  submitForm(): void {
    if (!this.validateForms()) {
      return;
    }

    this.loading = true;

    if (this.projectId) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  // submitForm() {
  //   if(!this.validateForms()) {
  //     return;
  //   }

  //   const attachments = this.generalInformationForm.value.attachments;

  //   if (this.projectId) {
  //     this.updateProject();
  //     return;
  //   } else {
  //     this.createProject();
  //   }

  //   this.loading = true;

  //   const selectedType = this.typeForm.value.type;
  //   const availableTypes = this.types.map((type) => type.value);
  //   const tags = this.generalInformationForm.value.tags;

  //   console.log('Selected type:', selectedType);
  //   console.log('Tags:', tags);

  //   const createProjecySub = this.projectService
  //     .createProject({
  //       title: this.generalInformationForm.value.title ?? '',
  //       description: this.generalInformationForm.value.description ?? '',
  //       type: selectedType ?? '',
  //       progress: this.generalInformationForm.value.progress ?? 0,
  //       tagIds: tags ?? [],
  //     })
  //     .subscribe((response) => {
  //       const projectId = response.id;

  //       if (attachments && attachments.length > 0) {
  //         this.handleAttachments(
  //           attachments,
  //           selectedType as ProjectType,
  //           projectId
  //         );
  //       }

  //       switch (selectedType) {
  //         case 'PUBLICATION':
  //           this.handlePublicationCreation(projectId);
  //           break;
  //         case 'PATENT':
  //           this.handlePatentCreation(projectId);
  //           break;
  //         case 'RESEARCH':
  //           const participants = this.researchProjects.value.participants?.map(
  //             (participant: string) => parseInt(participant)
  //           );

  //           console.log('Participants:', participants);
  //           this.researchService
  //             .createResearch({
  //               projectId,
  //               ...this.researchProjects.value,
  //               startDate: new Date(
  //                 this.researchProjects.value.startDate!
  //               ).toISOString(),
  //               endDate: new Date(
  //                 this.researchProjects.value.endDate!
  //               ).toISOString(),
  //               participantIds: participants,
  //               status: this.researchProjects.value.status!,
  //             })
  //             .subscribe((response) =>
  //               console.log('Research created:', response)
  //             );

  //           break;

  //         default:
  //           break;
  //       }
  //     });

  //   this.subscriptions.push(createProjecySub);
  // }

  createProject() {
    const projectData: CreateProjectRequest = {
      title: this.generalInformationForm.value.title ?? '',
      description: this.generalInformationForm.value.description ?? '',
      type:
        (this.typeForm.value.type as ProjectType) ?? ProjectType.PUBLICATION,
      progress: this.generalInformationForm.value.progress ?? 0,
      tagIds: this.generalInformationForm.value.tags ?? [],
      createdBy: this.creatorId ?? 0,
    };

    const attachments = this.generalInformationForm.value.attachments ?? [];

    this.projectService
      .createProject(projectData)
      .pipe(
        switchMap((projectResponse) => {
          const projectId = projectResponse.data.id;
          const operations: Observable<any>[] = [];
          if (attachments.length > 0) {
            operations.push(
              this.handleAttachments(attachments, projectData.type, projectId)
            );
          }

          operations.push(
            this.handleTypedProjectCreation(projectId, projectData.type)
          );

          return forkJoin(operations).pipe(map(() => projectResponse));
        })
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/projects', response.data.id]);
        },
        error: (error) => {
          console.error('Error creating project:', error);
          this.loading = false;
        },
      });
  }

  // updateProject() {
  //   const projectId = this.projectId;

  //   if (!projectId) {
  //     console.error('Project ID is not defined');
  //     return;
  //   }

  //   const tags = this.generalInformationForm.value.tags;
  //   const attachments = this.generalInformationForm.value.attachments || [];
  //   this.loading = true;

  //   const updateProjectSub = this.projectService
  //     .updateProject(projectId, {
  //       title: this.generalInformationForm.value.title,
  //       description: this.generalInformationForm.value.description,
  //       progress: this.generalInformationForm.value.progress,
  //       tagIds: tags,
  //       type: this.typeForm.value.type,
  //     })
  //     .subscribe((projectResponse) => {
  //       console.log('Project updated:', projectResponse);

  //       const selectedType = this.typeForm.value.type;

  //       if (attachments.length > 0) {
  //         const updateAttachmentsSub = this.attachmentsService
  //           .updateFiles(selectedType as ProjectType, projectId, attachments)
  //           .subscribe({
  //             next: (response) => {
  //               console.log('Files updated:', response);
  //               this.loading = false;
  //               this.router.navigate(['/projects']);
  //             },
  //             error: (error) => {
  //               console.error('Error updating files:', error);
  //               this.loading = false;
  //             },
  //           });

  //         this.subscriptions.push(updateAttachmentsSub);
  //       }

  //       const typedSub = this.typedProject$.subscribe((typedProject) => {
  //         if (!typedProject) {
  //           console.error('Typed project is not defined');
  //           this.loading = false;
  //           return;
  //         }

  //         switch (selectedType) {
  //           case 'PUBLICATION':
  //             this.handlePublicationUpdate(typedProject.id, projectId);
  //             break;

  //           case 'PATENT':
  //             this.handlePatentUpdate(typedProject.id, projectId);
  //             break;
  //           case 'RESEARCH':
  //             const participants =
  //               this.researchProjects.value.participants?.map(
  //                 (participant: string) => parseInt(participant)
  //               );
  //             const updateResearchSub = this.researchService
  //               .updateResearch(typedProject.id, {
  //                 projectId: this.projectId,
  //                 participantIds: participants,
  //                 budget: this.researchProjects.value.budget,
  //                 startDate: new Date(
  //                   this.researchProjects.value.startDate!
  //                 ).toISOString(),
  //                 endDate: new Date(
  //                   this.researchProjects.value.endDate!
  //                 ).toISOString(),
  //                 status: this.researchProjects.value.status!,
  //                 fundingSource: this.researchProjects.value.fundingSource,
  //               })
  //               .subscribe({
  //                 next: (researchResponse) =>
  //                   console.log('Research updated:', researchResponse),
  //                 error: (error) =>
  //                   console.error('Error updating research:', error),
  //               });
  //             this.subscriptions.push(updateResearchSub);
  //             this.loading = false;
  //             break;
  //           default:
  //             break;
  //         }
  //       });

  //       this.subscriptions.push(typedSub);
  //     });

  //   this.subscriptions.push(updateProjectSub);
  // }

  private updateProject(): void {
    if (!this.projectId) {
      console.error('Project ID is not defined');
      this.loading = false;
      return;
    }

    const projectData: UpdateProjectRequest = {
      title: this.generalInformationForm.value.title ?? '',
      description: this.generalInformationForm.value.description ?? '',
      progress: this.generalInformationForm.value.progress ?? 0,
      tagIds: this.generalInformationForm.value.tags ?? [],
      type: this.typeForm.value.type as ProjectType,
    };

    const attachments = this.generalInformationForm.value.attachments ?? [];

    this.projectService
      .updateProject(this.projectId, projectData)
      .pipe(
        switchMap((projectResponse) => {
          const operations: Observable<any>[] = [];
          if (attachments.length > 0) {
            operations.push(
              this.attachmentsService.updateFiles(
                projectResponse.data.type as ProjectType,
                this.projectId!,
                attachments
              )
            );
          }

          return this.typedProject$.pipe(
            take(1),
            switchMap((typedProject) => {
              if (!typedProject) {
                operations.push(
                  this.handleTypedProjectUpdate(
                    typedProject.id,
                    this.projectId!,
                    projectData.type!
                  )
                );
              }
              return forkJoin(operations);
            })
          );
        })
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.loading = false;
        },
      });
  }

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
        return this.researchService.createResearch(researchData);
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
        return this.researchService.updateResearch(
          typedProjectId,
          researchData
        );
      default:
        console.error('Invalid project type');
        return of(null);
    }
  }

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

  private handlePublicationCreation(projectId: string): void {
    if (!this.publicationsForm.valid) {
      this.publicationsForm.markAllAsTouched();
      return;
    }
    const publicationData = this.getPublicationFormValues(
      projectId
    ) as CreatePublicationRequest;

    const createPublicationSub = this.publicationService
      .createPublication(publicationData)
      .subscribe({
        next: (publicationResponse) => {
          console.log('Publication created:', publicationResponse);
          this.loading = false;
          this.router.navigate(['/projects', projectId]);
        },
        error: (error) => {
          console.error('Error creating publication:', error);
          this.loading = false;
        },
      });
    this.subscriptions.push(createPublicationSub);
  }

  private handlePublicationUpdate(
    publicationId: string,
    projectId: string
  ): void {
    if (!this.publicationsForm.valid) {
      this.publicationsForm.markAllAsTouched();
      return;
    }
    const publicationData = {
      ...this.getPublicationFormValues(projectId),
      id: publicationId,
    } as UpdatePublicationRequest;

    const updatePublicationSub = this.publicationService
      .updatePublication(publicationId, publicationData)
      .subscribe({
        next: (publicationResponse) => {
          console.log('Publication updated:', publicationResponse);
          this.loading = false;
          this.router.navigate(['/projects', projectId]);
        },
        error: (error) => {
          console.error('Error updating publication:', error);
          this.loading = false;
        },
      });

    this.subscriptions.push(updatePublicationSub);
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

  private handlePatentCreation(projectId: string): void {
    if (!this.patentsForm.valid) {
      this.patentsForm.markAllAsTouched();
      return;
    }

    const patentData = this.getPatentFormValues(
      projectId
    ) as CreatePatentRequest;
    const createPatentSub = this.patentService
      .createPatent(patentData)
      .subscribe({
        next: (patentResponse) => {
          console.log('Patent created:', patentResponse);
          this.loading = false;
          this.router.navigate(['/projects', projectId]);
        },
        error: (error) => {
          console.error('Error creating patent:', error);
          this.loading = false;
        },
      });
    this.subscriptions.push(createPatentSub);
  }

  private handlePatentUpdate(patentId: string, projectId: string): void {
    if (!this.patentsForm.valid) {
      this.patentsForm.markAllAsTouched();
      return;
    }
    const patentData = {
      ...this.getPatentFormValues(projectId),
      id: patentId,
    } as UpdatePatentRequest;

    const updatePatentSub = this.patentService
      .updatePatent(patentId, patentData)
      .subscribe({
        next: (patentResponse) => {
          console.log('Patent updated:', patentResponse);
          this.loading = false;
          this.router.navigate(['/projects', projectId]);
        },
        error: (error) => {
          console.error('Error updating patent:', error);
          this.loading = false;
        },
      });

    this.subscriptions.push(updatePatentSub);
  }

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
        if (!this.researchProjects.valid) {
          this.researchProjects.markAllAsTouched();
          return false;
        }
        break;
      default:
        console.error('Invalid project type');
        return false;
    }

    return true;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

// TODO: PUBLICATION AND RESEARCH FRONT END REFACTORING
