import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
    console.log('Project ID:', this.projectId);

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
    console.log('Before patching - typeForm:', this.typeForm); // Add this

    if (!this.projectId) return;

    this.loading = true;
    this.headerService.setTitle('Edit Project: ' + this.projectId);

    this.typeForm = this.projectFormService.createTypeForm();

    this.subscriptions.push(
      this.projectDataService
        .getProjectById(this.projectId)
        .pipe(
          tap((project) => {
            if (!project) return;

            // Use setTimeout to ensure change detection runs
            setTimeout(() => {
              console.log('before patching - project:', project.data);
              this.projectFormService.patchTypeForm(
                this.typeForm,
                project.data.type
              );
              this.typeForm.disable();
              this.cdr.detectChanges(); // Add this line
              console.log('After patching - typeForm:', this.typeForm.value);
              console.log('Form disabled status:', this.typeForm.disabled);
            });
          }),
          switchMap((project) => {
            if (!project) return of(null);

            // this.projectFormService.patchTypeForm(
            //   this.typeForm,
            //   project.data.type
            // );
            // this.typeForm.disable();
            this.projectFormService.patchGeneralInformationForm(
              this.generalInformationForm,
              project.data
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
                      console.log('Patent:', patent);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
