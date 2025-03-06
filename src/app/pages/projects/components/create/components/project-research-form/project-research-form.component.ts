import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CreateWorkService } from '@core/services/create-work.service';
import { map, Observable, startWith } from 'rxjs';
import { Filter } from '@shared/types/filters.types';
import { authors, statuses } from '@content/createProject.content';

@Component({
  selector: 'create-project-research-form',
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
  templateUrl: './project-research-form.component.html',
  styleUrl: './project-research-form.component.scss',
})
export class ProjectResearchFormComponent implements OnInit {
  private createWorkService = inject(CreateWorkService);

  researchProjectsFormSig = input.required<
    FormGroup<{
      participants: FormControl<string[] | null>;
      budget: FormControl<number | null>;
      startDate: FormControl<Date | null>;
      endDate: FormControl<Date | null>;
      status: FormControl<Filter | null>;
      fundingSource: FormControl<string | null>;
    }>
  >({ alias: 'researchProjectsForm' });
  allUsersSig = input.required<any[] | null>({ alias: 'allUsers' });

  statuses = statuses;
  participants = authors;

  ngOnInit(): void {}
}
