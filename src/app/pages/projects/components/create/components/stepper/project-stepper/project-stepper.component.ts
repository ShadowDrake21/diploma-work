import { Component, inject, input } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { ProjectFormService } from '@core/services/project-form.service';
import { ProjectTypeStepComponent } from '../project-type-step/project-type-step.component';
import { ProjectGeneralInfoStepComponent } from '../project-general-info-step/project-general-info-step.component';
import { ProjectWorkInfoStepComponent } from '../project-work-info-step/project-work-info-step.component';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkFormPipe } from '@pipes/work-form.pipe';
import { FileMetadataDTO } from '@models/file.model';

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
    JsonPipe,
  ],
  templateUrl: './project-stepper.component.html',
  styleUrl: './project-stepper.component.scss',
})
export class ProjectStepperComponent {
  formService = inject(ProjectFormService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  typeForm = input.required<FormGroup>();
  generalInfoForm = input.required<FormGroup>();
  publicationForm = input.required<FormGroup>();
  patentForm = input.required<FormGroup>();
  researchForm = input.required<FormGroup>();

  errorMessage = '';

  private getCurrentWorkForm() {
    const type = this.typeForm()?.value.type;

    return this.transformWorkForm(
      type,
      this.publicationForm(),
      this.patentForm(),
      this.researchForm()
    );
  }

  submitForm() {
    if (this.formService.loading.value) return;

    if (!this.typeForm().valid && !this.typeForm().disabled) {
      return;
    }

    const workForm = this.getCurrentWorkForm();
    if (!workForm?.valid) {
      console.warn('Work form is invalid');
      return;
    }

    const allAttachments = this.generalInfoForm()?.value.attachments || [];
    const newFiles = allAttachments.filter(
      (item: File | FileMetadataDTO) => item instanceof File
    ) as File[];

    if (!this.formService.creatorId) {
      console.error('No creator ID available');
      return;
    }

    this.formService.loading.next(true);

    const projectId = this.route.snapshot.queryParamMap.get('id');

    this.formService
      .submitForm(
        this.typeForm()!,
        this.generalInfoForm()!,
        workForm,
        projectId,
        this.formService.creatorId,
        newFiles
      )
      .subscribe({
        next: (response) => {
          console.log('Form submitted successfully', response);
          this.formService.loading.next(false);
          this.router.navigate(['/projects', response[0].projectId]);
        },
        error: (error) => {
          console.error('Error submitting form', error);
          this.formService.loading.next(false);
        },
      });
  }

  private transformWorkForm(
    type: string,
    publicationForm: FormGroup,
    patentForm: FormGroup,
    researchForm: FormGroup
  ): FormGroup {
    const pipe = new WorkFormPipe();
    return pipe.transform(type, publicationForm, patentForm, researchForm);
  }
}
