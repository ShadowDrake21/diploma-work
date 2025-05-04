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
import { UserService } from '@core/services/user.service';
import { BaseFormComponent } from '@shared/abstract/base-form/base-form.component';
import {
  BaseFormInputs,
  PatentFormGroup,
} from '@shared/types/project-form.types';

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
export class ProjectPatentFormComponent
  extends BaseFormComponent
  implements OnInit
{
  private userService = inject(UserService);

  patentsFormSig = input.required<PatentFormGroup>({ alias: 'patentsForm' });
  allUsers$!: Observable<BaseFormInputs['allUsers']>;

  ngOnInit(): void {
    this.allUsers$ = this.userService.getAllUsers();
  }

  comparePrimaryAuthors = (id1: number, id2: number) =>
    this.compareIds(id1, id2);

  compareCoInventors = (id1: number, id2: number) => this.compareIds(id1, id2);
}
