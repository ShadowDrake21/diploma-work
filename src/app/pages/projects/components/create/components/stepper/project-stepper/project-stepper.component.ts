import { Component, inject } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { ProjectFormService } from '@core/services/project-form.service';
import { ProjectTypeStepComponent } from '../project-type-step/project-type-step.component';
import { ProjectGeneralInfoStepComponent } from '../project-general-info-step/project-general-info-step.component';
import { ProjectWorkInfoStepComponent } from '../project-work-info-step/project-work-info-step.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'create-project-stepper',
  imports: [
    MatStepperModule,
    ProjectTypeStepComponent,
    ProjectGeneralInfoStepComponent,
    ProjectWorkInfoStepComponent,
    AsyncPipe,
  ],
  templateUrl: './project-stepper.component.html',
  styleUrl: './project-stepper.component.scss',
})
export class ProjectStepperComponent {
  formService = inject(ProjectFormService);

  typeForm = this.formService.createTypeForm();
  generalInfoForm = this.formService.createGeneralInfoForm();
  publicationForm = this.formService.createPublicationForm();
  patentForm = this.formService.createPatentForm();
  researchForm = this.formService.createResearchForm();

  getCurrentWorkForm() {
    switch (this.typeForm.value.type) {
      case 'PUBLICATION':
        return this.publicationForm;
      case 'PATENT':
        return this.patentForm;
      case 'RESEARCH':
        return this.researchForm;
      default:
        return this.publicationForm;
    }
  }

  submitForm() {
    const workForm = this.getCurrentWorkForm();
    const attachments = this.generalInfoForm.value.attachments || [];

    this.formService
      .submitForm(
        this.typeForm,
        this.generalInfoForm,
        workForm,
        null,
        this.formService.creatorId,
        attachments
      )
      .subscribe({
        next: (response) => {
          console.log('Form submitted successfully', response);
        },
        error: (error) => {
          console.error('Error submitting form', error);
        },
      });
  }
}
