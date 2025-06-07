import {
  Component,
  computed,
  inject,
  input,
  SimpleChanges,
} from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { ProjectTypeStepComponent } from '../project-type-step/project-type-step.component';
import { ProjectGeneralInfoStepComponent } from '../project-general-info-step/project-general-info-step.component';
import { ProjectWorkInfoStepComponent } from '../project-work-info-step/project-work-info-step.component';
import { AsyncPipe } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkFormPipe } from '@pipes/work-form.pipe';
import {
  GeneralInformationForm,
  PatentForm,
  PublicationForm,
  ResearchForm,
  TypeForm,
} from '@shared/types/forms/project-form.types';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'create-project-stepper',
  imports: [
    MatStepperModule,
    ProjectTypeStepComponent,
    ProjectGeneralInfoStepComponent,
    ProjectWorkInfoStepComponent,
    AsyncPipe,
    MatButton,
    MatProgressBar,
    WorkFormPipe,
  ],
  templateUrl: './project-stepper.component.html',
  styleUrl: './project-stepper.component.scss',
})
export class ProjectStepperComponent {
  private readonly submissionService = inject(ProjectFormService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  formService = inject(ProjectFormService);

  typeForm = input.required<FormGroup<TypeForm>>();
  generalInfoForm = input.required<FormGroup<GeneralInformationForm>>();
  publicationForm = input.required<FormGroup<PublicationForm>>();
  patentForm = input.required<FormGroup<PatentForm>>();
  researchForm = input.required<FormGroup<ResearchForm>>();

  loading = toSignal(this.formService.loading, { initialValue: false });
  isEditing = computed(() => this.formService.isEditing);
  subtext = computed(() =>
    this.isEditing() ? 'Edit your project' : 'Create a new project'
  );
  authors = this.formService.authors;

  submitForm() {
    if (this.loading()) return;

    if (!this.typeForm().valid && !this.typeForm().disabled) {
      this.notificationService.showError('Please select a valid project type');
      return;
    }

    const workForm = this.getCurrentWorkForm();
    if (!workForm?.valid) {
      this.notificationService.showError(
        'Please fill out all required work information'
      );
      return;
    }

    const allAttachments = this.generalInfoForm()?.value.attachments || [];
    const newFiles = allAttachments.filter(
      (item): item is File => item instanceof File
    );

    if (!this.formService.creatorId) {
      this.notificationService.showError(
        'Unable to identify user. Please try again later.'
      );
      return;
    }

    const projectId = this.route.snapshot.queryParamMap.get('id');

    this.submissionService
      .submitForm(
        this.typeForm(),
        this.generalInfoForm(),
        workForm,
        projectId,
        this.formService.creatorId,
        newFiles
      )
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess(
            this.isEditing()
              ? 'Project updated successfully'
              : 'Project created successfully'
          );
          this.router.navigate(['/projects', response[0].projectId]);
        },
        error: (error) => {
          const errorMessage =
            error.message ||
            (this.isEditing()
              ? 'Failed to update project'
              : 'Failed to create project');
          this.notificationService.showError(errorMessage);
        },
      });
  }

  private getCurrentWorkForm() {
    try {
      return new WorkFormPipe().transform(
        this.typeForm()?.value.type || '',
        this.publicationForm(),
        this.patentForm(),
        this.researchForm()
      );
    } catch (error) {
      this.notificationService.showError('Invalid project type selected');
      return null;
    }
  }
}
