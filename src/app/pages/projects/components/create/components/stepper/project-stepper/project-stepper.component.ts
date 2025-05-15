import { Component, computed, inject, input } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { ProjectFormService } from '@core/services/project-form.service';
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
  private submissionService = inject(ProjectFormService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
    if (!this.typeForm().valid && !this.typeForm().disabled) return;

    const workForm = this.getCurrentWorkForm();
    if (!workForm?.valid) {
      console.warn('Work form is invalid');
      return;
    }

    const allAttachments = this.generalInfoForm()?.value.attachments || [];
    const newFiles = allAttachments.filter(
      (item): item is File => item instanceof File
    );

    if (!this.formService.creatorId) {
      console.error('No creator ID available');
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
      .subscribe((response) => {
        this.router.navigate(['/projects', response[0].projectId]);
      });
  }

  private getCurrentWorkForm() {
    return new WorkFormPipe().transform(
      this.typeForm()?.value.type || '',
      this.publicationForm(),
      this.patentForm(),
      this.researchForm()
    );
  }
}
