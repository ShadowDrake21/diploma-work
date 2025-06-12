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
import { UserService } from '@core/services/users/user.service';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '@shared/models/user.model';
import { ProjectStepperComponent } from './components/stepper/project-stepper/project-stepper.component';
import { ProjectLoaderService } from '@core/services/project/project-creation/project-loader.service';
import { NotificationService } from '@core/services/notification.service';
import { types } from '@shared/content/project.content';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';

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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly userService = inject(UserService);
  private readonly projectLoaderService = inject(ProjectLoaderService);
  private readonly notificationService = inject(NotificationService);
  private readonly projectFormService = inject(ProjectFormService);

  private readonly cdr = inject(ChangeDetectorRef);

  creatorId: number | null = null;
  projectId: string | null = null;
  types = types;
  loading: boolean = false;
  subtext: string =
    'Виберіть тип запису, який ви хочете створити, та надайте необхідну інформацію.';

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
    this.headerService.setTitle('Створити новий запис');
    this.projectId = this.route.snapshot.queryParamMap.get('id');

    this.subscriptions.push(
      this.userService.getCurrentUser().subscribe({
        next: (user: IUser) => {
          this.creatorId = +user.id;
        },
        error: (error) => {
          console.error('Failed to load user data:', error);
          this.notificationService.showError(
            'Не вдалося завантажити інформацію про користувача'
          );
          this.router.navigate(['/']);
        },
      })
    );

    if (this.projectId) {
      this.projectFormService.isEditing = true;
      this.loadExistingProject();
    } else {
      this.projectFormService.isEditing = false;
    }
  }

  private loadExistingProject(): void {
    if (!this.projectId) return;

    this.loading = true;
    this.headerService.setTitle('Редагувати проєкт: ' + this.projectId);

    this.subscriptions.push(
      this.projectLoaderService.loadProject(this.projectId).subscribe({
        next: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading project:', error);
          this.notificationService.showError(
            error.status === 404
              ? 'Проєкт не знайдено'
              : 'Не вдалося завантажити дані проєкту'
          );
          this.loading = false;
          this.router.navigate(['/projects']);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    try {
      this.projectLoaderService.clearAllForms();
    } catch (error) {
      console.error('Error clearing forms:', error);
    }
  }
}
