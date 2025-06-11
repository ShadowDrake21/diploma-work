import { Component, input, SimpleChanges } from '@angular/core';
import { ProjectGeneralInformationComponent } from '../../project-general-information/project-general-information.component';
import { FormGroup } from '@angular/forms';
import { FileMetadataDTO } from '@models/file.model';
import { GeneralInformationForm } from '@shared/types/forms/project-form.types';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'create-project-general-info-step',
  imports: [ProjectGeneralInformationComponent, JsonPipe],
  templateUrl: './project-general-info-step.component.html',
  styleUrl: './project-general-info-step.component.scss',
})
export class ProjectGeneralInfoStepComponent {
  generalInfoForm = input.required<FormGroup<GeneralInformationForm>>();
  typeForm = input.required<FormGroup>();
}
