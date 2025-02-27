import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MultipleFileUploadComponent } from '@shared/components/multiple-file-upload/multiple-file-upload.component';
import { AVAILABLE_PROJECT_TAGS } from '@content/projects.content';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'create-project-general-information',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MultipleFileUploadComponent,
    MatAutocompleteModule,
    MatSliderModule,
    MatDatepickerModule,
  ],
  templateUrl: './project-general-information.component.html',
  styleUrl: './project-general-information.component.scss',
})
export class ProjectGeneralInformationComponent {
  generalInformationFormSig = input.required<
    FormGroup<{
      title: FormControl<string | null>;
      description: FormControl<string | null>;
      progress: FormControl<number | null>;
      tags: FormControl<string[] | null>;
      attachments: FormControl<string[] | null>;
    }>
  >({ alias: 'generalInformationForm' });

  tags = AVAILABLE_PROJECT_TAGS;
}
