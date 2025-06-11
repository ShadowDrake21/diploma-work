import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { types } from '@shared/content/project.content';
import { ProjectType } from '@shared/enums/categories.enum';
import { TYPE_FORM_ERRORS } from '../errors/type.errors';

@Component({
  selector: 'create-project-type',
  imports: [
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './project-type.component.html',
  styleUrl: './project-type.component.scss',
})
export class ProjectTypeComponent {
  typeForm = input.required<
    FormGroup<{
      type: FormControl<ProjectType | null>;
    }>
  >();

  types = types;
  formErrors = TYPE_FORM_ERRORS;
}
