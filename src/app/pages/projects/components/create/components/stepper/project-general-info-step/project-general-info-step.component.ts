import { Component, input } from '@angular/core';
import { ProjectGeneralInformationComponent } from '../../project-general-information/project-general-information.component';
import { FormGroup } from '@angular/forms';
import { FileMetadataDTO } from '@models/file.model';

@Component({
  selector: 'create-project-general-info-step',
  imports: [ProjectGeneralInformationComponent],
  templateUrl: './project-general-info-step.component.html',
  styleUrl: './project-general-info-step.component.scss',
})
export class ProjectGeneralInfoStepComponent {
  generalInfoForm = input.required<FormGroup>();
  typeForm = input.required<FormGroup>();
  existingFilesSig = input<FileMetadataDTO[] | null | undefined>(null, {
    alias: 'existingFiles',
  });
}
