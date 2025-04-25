import { JsonPipe } from '@angular/common';
import { Component, input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { types } from '@content/createProject.content';
import { Subscription } from 'rxjs';

@Component({
  selector: 'create-project-type',
  imports: [
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    JsonPipe,
  ],
  templateUrl: './project-type.component.html',
  styleUrl: './project-type.component.scss',
})
export class ProjectTypeComponent {
  typeFormSig = input.required<
    FormGroup<{
      type: FormControl<string | null>;
    }>
  >({ alias: 'typeForm' });

  types = types;
}
