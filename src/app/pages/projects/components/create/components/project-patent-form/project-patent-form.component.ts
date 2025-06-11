import { Component, inject, input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UserService } from '@core/services/users/user.service';
import { BaseFormComponent } from '@shared/abstract/base-form/base-form.component';
import {
  BaseFormInputs,
  PatentFormGroup,
} from '@shared/types/forms/project-form.types';
import { NotificationService } from '@core/services/notification.service';
import { PATENT_FORM_ERRORS } from '../errors/patent.errors';

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
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  patentsForm = input.required<PatentFormGroup>();
  allUsers$!: Observable<BaseFormInputs['allUsers']>;
  selectedPrimaryAuthor: number | null = null;

  formErrors = PATENT_FORM_ERRORS;

  ngOnInit(): void {
    this.allUsers$ = this.userService.getAllUsers().pipe(
      catchError((error) => {
        console.error('Error loading users:', error);
        this.notificationService.showError(
          'Не вдалося завантажити винахідників'
        );
        return of([]);
      })
    );

    const initialValue = this.patentsForm().get('primaryAuthor')?.value || null;
    this.selectedPrimaryAuthor = initialValue !== null ? +initialValue : null;

    this.patentsForm()
      .get('primaryAuthor')
      ?.valueChanges.subscribe((authorId) => {
        this.selectedPrimaryAuthor = authorId !== null ? +authorId : null;

        const coInventors = this.patentsForm().get('coInventors')?.value;
        if (coInventors && this.selectedPrimaryAuthor !== null) {
          this.patentsForm()
            .get('coInventors')
            ?.setValue(
              coInventors.filter(
                (id: number) => id !== this.selectedPrimaryAuthor
              )
            );
        }
      });
  }

  comparePrimaryAuthors = (id1: number, id2: number) =>
    this.compareIds(id1, id2);

  compareCoInventors = (id1: number, id2: number) => this.compareIds(id1, id2);
}
