import { Component, input } from '@angular/core';
import { ProjectGeneralInformationComponent } from '../../project-general-information/project-general-information.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'create-project-general-info-step',
  imports: [ProjectGeneralInformationComponent],
  styleUrl: './project-general-info-step.component.scss',
  template: `
    @let generalInfoForm = generalInfoFormSig(); @let typeForm = typeFormSig();
    @let existingFiles = existingFilesSig(); @if (generalInfoForm && typeForm) {
    <create-project-general-information
      [generalInformationForm]="generalInfoForm"
      [entityType]="typeForm.value.type"
      [existingFiles]="existingFiles"
    />
    }
  `,
})
export class ProjectGeneralInfoStepComponent {
  generalInfoFormSig = input<FormGroup | null>(null, {
    alias: 'generalInfoForm',
  });
  typeFormSig = input<FormGroup | null>(null, { alias: 'typeForm' });
  existingFilesSig = input<File[] | null | undefined>(null, {
    alias: 'existingFiles',
  });
}
