import { Component, input } from '@angular/core';
import { ProjectGeneralInformationComponent } from '../../project-general-information/project-general-information.component';
import { FormGroup } from '@angular/forms';
import { GeneralInformationForm } from '@shared/types/forms/project-form.types';

@Component({
  selector: 'create-project-general-info-step',
  imports: [ProjectGeneralInformationComponent],
  templateUrl: './project-general-info-step.component.html',
  styleUrl: './project-general-info-step.component.scss',
})
export class ProjectGeneralInfoStepComponent {
  generalInfoForm = input.required<FormGroup<GeneralInformationForm>>();
  typeForm = input.required<FormGroup>();
}
