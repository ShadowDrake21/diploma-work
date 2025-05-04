import { Component, inject, input } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { ProjectFormService } from '@core/services/project-form.service';
import { ProjectTypeStepComponent } from '../project-type-step/project-type-step.component';
import { ProjectGeneralInfoStepComponent } from '../project-general-info-step/project-general-info-step.component';
import { ProjectWorkInfoStepComponent } from '../project-work-info-step/project-work-info-step.component';
import { AsyncPipe } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';

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
  ],
  templateUrl: './project-stepper.component.html',
  styleUrl: './project-stepper.component.scss',
})
export class ProjectStepperComponent {
  formService = inject(ProjectFormService);

  typeForm = input.required<FormGroup>();
  generalInfoForm = input.required<FormGroup>();
  publicationForm = input.required<FormGroup>();
  patentForm = input.required<FormGroup>();
  researchForm = input.required<FormGroup>();

  errorMessage = '';

  getCurrentWorkForm() {
    switch (this.typeForm()?.value.type) {
      case 'PUBLICATION':
        return this.publicationForm();
      case 'PATENT':
        return this.patentForm();
      case 'RESEARCH':
        return this.researchForm();
      default:
        return this.publicationForm();
    }
  }

  submitForm() {
    if (this.formService.loading.value) return;

    if (!this.typeForm().valid || !this.generalInfoForm().valid) {
      console.warn('Required forms are invalid');
      return;
    }

    const workForm = this.getCurrentWorkForm();
    if (!workForm?.valid) {
      console.warn('Work form is invalid');
      return;
    }

    const attachments = this.generalInfoForm()?.value.attachments || [];

    if (!this.formService.creatorId) {
      console.error('No creator ID available');
      return;
    }

    this.formService.loading.next(true);

    this.formService
      .submitForm(
        this.typeForm()!,
        this.generalInfoForm()!,
        workForm,
        null,
        this.formService.creatorId,
        attachments
      )
      .subscribe({
        next: (response) => {
          console.log('Form submitted successfully', response);
          this.formService.loading.next(false);
        },
        error: (error) => {
          console.error('Error submitting form', error);
          this.formService.loading.next(false);
        },
      });
  }
}
