import { Component, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { types } from '@content/createProject.content';
import { ProjectType } from '@shared/enums/categories.enum';

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
export class ProjectTypeComponent implements OnInit {
  typeForm = input.required<
    FormGroup<{
      type: FormControl<ProjectType | null>;
    }>
  >();

  ngOnInit() {
    this.typeForm().valueChanges.subscribe((values) => {
      console.log('Form values changed:', values);
    });
  }

  types = types;
}
