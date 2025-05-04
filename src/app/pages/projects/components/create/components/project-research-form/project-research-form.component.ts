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
import { IUser } from '@shared/types/users.types';
import { BaseFormComponent } from '@shared/abstract/base-form/base-form.component';
import { ResearchFormGroup } from '@shared/types/project-form.types';

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
export class ProjectResearchFormComponent extends BaseFormComponent {
  researchProjectsFormSig = input.required<ResearchFormGroup>({
    alias: 'researchesForm',
  });

  statuses = statuses;

  compareParticipants = (id1: string, id2: string) => this.compareIds(id1, id2);

  compareStatuses = (status1: string, status2: Filter | string) => {
    if (typeof status2 === 'string') {
      return status1 === status2;
    }
    return status1 === status2.value;
  };
}
