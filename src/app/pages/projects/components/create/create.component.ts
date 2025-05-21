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
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '@shared/models/user.model';
import { ProjectStepperComponent } from './components/stepper/project-stepper/project-stepper.component';
import { ProjectLoaderService } from '@core/services/project/project-creation/project-loader.service';

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
export class CreateProjectComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private userService = inject(UserService);
  private projectLoaderService = inject(ProjectLoaderService);
  private cdr = inject(ChangeDetectorRef);

  creatorId: number | null = null;
  projectId: string | null = null;
  types = types;
  loading: boolean = false;
  subtext: string =
    'Choose the type of record you want to create and provide the required details.';

  typeForm = this.projectLoaderService.typeForm;
  generalInformationForm = this.projectLoaderService.generalInformationForm;
  publicationsForm = this.projectLoaderService.publicationsForm;
  patentsForm = this.projectLoaderService.patentsForm;
  researchesForm = this.projectLoaderService.researchesForm;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.headerService.setTitle('Create New Entry');
    this.projectId = this.route.snapshot.queryParamMap.get('id');

    this.subscriptions.push(
      this.userService
        .getCurrentUser()
        .pipe(map((result) => result.data))
        .subscribe((user: IUser) => {
          this.creatorId = +user.id;
        })
    );

    if (this.projectId) {
      this.loadExistingProject();
    }
  }

  private loadExistingProject(): void {
    if (!this.projectId) return;

    this.loading = true;
    this.headerService.setTitle('Edit Project: ' + this.projectId);

    this.subscriptions.push(
      this.projectLoaderService
        .loadProject(this.projectId)

        .subscribe({
          next: () => {
            this.loading = false;
            this.cdr.detectChanges();
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
    this.subscriptions = [];
  }
}
