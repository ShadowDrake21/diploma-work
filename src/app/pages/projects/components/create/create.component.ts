import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { types } from '@content/createProject.content';
import { UserService } from '@core/services/user.service';
import { of, Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectType } from '@shared/enums/categories.enum';
import { ProjectSharedService } from '@core/services/project-shared.service';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@models/project.model';
import { IUser } from '@shared/types/users.types';
import { ProjectFormService } from '@core/services/project-form.service';
import { ProjectDataService } from '@core/services/project-data.service';
import { ProjectStepperComponent } from './components/stepper/project-stepper/project-stepper.component';

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
    ProjectStepperComponent,
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
// TODO: move to different files + html
export class CreateProjectComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private userService = inject(UserService);
  private projectFormService = inject(ProjectFormService);
  private projectDataService = inject(ProjectDataService);
  private projectSharedService = inject(ProjectSharedService);

  creatorId: number | null = null;
  projectId: string | null = null;
  types = types;
  loading: boolean = false;
  subtext: string =
    'Choose the type of record you want to create and provide the required details.';

  typeForm = this.projectFormService.createTypeForm();
  generalInformationForm = this.projectFormService.createGeneralInfoForm();
  publicationsForm = this.projectFormService.createPublicationForm();
  patentsForm = this.projectFormService.createPatentForm();
  researchesForm = this.projectFormService.createResearchForm();

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.headerService.setTitle('Create New Entry');
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
    if (!this.projectId) return;

    this.loading = true;

    this.subscriptions.push(
      this.projectDataService
        .getProjectById(this.projectId)
        .pipe(
          switchMap((project) => {
            if (!project) return of(null);

            this.projectFormService.patchTypeForm(
              this.typeForm,
              project.data.type
            );
            this.typeForm.disable();
            this.projectFormService.patchGeneralInformationForm(
              this.generalInformationForm,
              project
            );

            switch (project.data.type) {
              case ProjectType.PUBLICATION:
                return this.projectDataService
                  .getPublicationByProjectId(this.projectId!)
                  .pipe(
                    tap((publication) => {
                      this.projectFormService.patchPublicationForm(
                        this.publicationsForm,
                        publication
                      );
                    })
                  );
              case ProjectType.PATENT:
                return this.projectDataService
                  .getPatentByProjectId(this.projectId!)
                  .pipe(
                    tap((patent) => {
                      this.projectFormService.patchPatentForm(
                        this.patentsForm,
                        patent
                      );
                    })
                  );
              case ProjectType.RESEARCH:
                return this.projectDataService
                  .getResearchByProjectId(this.projectId!)
                  .pipe(
                    tap((research) => {
                      this.projectFormService.patchResearchForm(
                        this.researchesForm,
                        research
                      );
                    })
                  );
              default:
                return of(null);
            }
          }),
          switchMap(() => {
            return this.projectDataService
              .getAttachments(
                this.typeForm.value.type as ProjectType,
                this.projectId!
              )
              .pipe(
                tap((attachments) => {
                  this.generalInformationForm.patchValue({ attachments });
                })
              );
          })
        )
        .subscribe({
          next: () => {
            this.loading = false;
            this.projectSharedService.isProjectCreation = false;
          },
          error: (error) => {
            console.error('Error loading project:', error);
            this.loading = false;
          },
        })
    );
  }

  submitForm(): void {
    if (!this.validateForms()) return;

    this.loading = true;
    const formValues = this.prepareFormValues();
    const attachments = this.generalInformationForm.value.attachments ?? [];

    const operation = this.projectId
      ? this.projectDataService.updateProject(
          this.projectId,
          this.buildProjectRequest() as UpdateProjectRequest,
          attachments,
          formValues
        )
      : this.projectDataService.createProject(
          this.buildProjectRequest() as CreateProjectRequest,
          attachments,
          formValues
        );

    this.subscriptions.push(
      operation.subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error),
      })
    );
  }

  private prepareFormValues(): any {
    const projectType = this.typeForm.value.type as ProjectType;
    switch (projectType) {
      case ProjectType.PUBLICATION:
        return { publication: this.publicationsForm.value };
      case ProjectType.PATENT:
        return { patent: this.patentsForm.value };
      case ProjectType.RESEARCH:
        return { research: this.researchesForm.value };
      default:
        return {};
    }
  }

  private handleSuccess(): void {
    this.loading = false;
    this.router.navigate(['/projects', this.projectId]);
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.loading = false;
  }

  private validateForms(): boolean {
    if (!this.typeForm.valid || !this.generalInformationForm.valid) {
      this.typeForm.markAllAsTouched();
      this.generalInformationForm.markAllAsTouched();
      return false;
    }

    const projectType = this.typeForm.value.type as ProjectType;
    let specificFormValid = true;

    switch (projectType) {
      case ProjectType.PUBLICATION:
        specificFormValid = this.publicationsForm.valid;
        if (!specificFormValid) this.publicationsForm.markAllAsTouched();

        break;
      case ProjectType.PATENT:
        specificFormValid = this.patentsForm.valid;
        if (!specificFormValid) this.patentsForm.markAllAsTouched();
        break;
      case ProjectType.RESEARCH:
        specificFormValid = this.researchesForm.valid;
        if (!specificFormValid) this.researchesForm.markAllAsTouched();
        break;
      default:
        console.error('Invalid project type');
        return false;
    }

    return specificFormValid;
  }

  private buildProjectRequest(): any {
    return {
      title: this.generalInformationForm.value.title ?? '',
      description: this.generalInformationForm.value.description ?? '',
      type: this.typeForm.value.type ?? ProjectType.PUBLICATION,
      progress: this.generalInformationForm.value.progress ?? 0,
      tagIds: this.generalInformationForm.value.tags ?? [],
      ...(this.projectId ? {} : { createdBy: this.creatorId ?? 0 }),
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
