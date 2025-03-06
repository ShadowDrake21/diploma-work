import { Component, inject, input, OnInit } from '@angular/core';
import { CreateWorkService } from '../../../../../../core/services/create-work.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { authors } from '@content/createProject.content';

@Component({
  selector: 'create-project-patent-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  templateUrl: './project-patent-form.component.html',
  styleUrl: './project-patent-form.component.scss',
})
export class ProjectPatentFormComponent {
  private createWorkService = inject(CreateWorkService);

  patentsFormSig = input.required<
    FormGroup<{
      primaryAuthor: FormControl<string | null>;
      coInventors: FormControl<string[] | null>;
      registrationNumber: FormControl<string | null>;
      registrationDate: FormControl<Date | null>;
      issuingAuthority: FormControl<string | null>;
    }>
  >({ alias: 'patentsForm' });
  allUsersSig = input.required<any[] | null>({ alias: 'allUsers' });

  authors = authors;
}
