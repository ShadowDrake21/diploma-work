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
export class ProjectPatentFormComponent implements OnInit {
  private createWorkService = inject(CreateWorkService);
  private userService = inject(UserService);

  patentsFormSig = input.required<
    FormGroup<{
      primaryAuthor: FormControl<string | null>;
      coInventors: FormControl<number[] | null>;
      registrationNumber: FormControl<string | null>;
      registrationDate: FormControl<Date | null>;
      issuingAuthority: FormControl<string | null>;
    }>
  >({ alias: 'patentsForm' });
  allUsers$!: Observable<any[]>;
  authorsSig = input.required<any[] | null>({ alias: 'authors' });

  authors = authors;

  ngOnInit(): void {
    console.log('ngOnInit', this.patentsFormSig().value.coInventors);
    this.allUsers$ = this.userService.getAllUsers();
  }

  comparePrimaryAuthors = (authorId1: number, authorId2: number) => {
    console.log('compatePrimaryAuthors', authorId1, authorId2);
    return authorId1 === authorId2;
  };

  compareCoInventors = (coInventorId1: number, coInventorId2: number) => {
    console.log(
      'compareCoInventors',
      coInventorId1,
      coInventorId2,
      typeof coInventorId1,
      typeof coInventorId2,
      this.patentsFormSig().value.coInventors
    );
    return coInventorId1 === coInventorId2;
  };
}
