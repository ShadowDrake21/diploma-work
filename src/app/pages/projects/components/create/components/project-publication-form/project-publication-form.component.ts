import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { catchError, Observable, of } from 'rxjs';
import { BaseFormComponent } from '@shared/abstract/base-form/base-form.component';
import {
  BaseFormInputs,
  PublicationFormGroup,
} from '@shared/types/forms/project-form.types';
import { UserService } from '@core/services/users/user.service';
import { AuthorNamePipe } from '@pipes/author-name.pipe';
import { NotificationService } from '@core/services/notification.service';
import { PUBLICATION_FORM_ERRORS } from '../errors/publication.errors';
import { FormErrorComponentComponent } from '@shared/components/form-error-component/form-error-component.component';

@Component({
  selector: 'create-project-publication-form',
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
    AuthorNamePipe,
    FormErrorComponentComponent,
  ],
  templateUrl: './project-publication-form.component.html',
})
export class ProjectPublicationFormComponent
  extends BaseFormComponent
  implements OnInit
{
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  publicationsForm = input.required<PublicationFormGroup>();

  formErrors = PUBLICATION_FORM_ERRORS;

  allUsers$!: Observable<BaseFormInputs['allUsers']>;

  ngOnInit(): void {
    this.allUsers$ = this.userService.getAllUsers().pipe(
      catchError((error) => {
        console.error('Error loading users:', error);
        this.notificationService.showError('Failed to load authors');
        return of([]);
      })
    );
  }

  compareAuthors = (id1: string, id2: string) => this.compareIds(id1, id2);

  getAuthorName(authorId: string, users: BaseFormInputs['allUsers']): string {
    const author = users?.find(
      (user) => user?.id.toString() === authorId.toString()
    );
    return author ? author.username : '';
  }
}
