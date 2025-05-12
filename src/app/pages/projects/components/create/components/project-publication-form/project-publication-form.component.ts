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
import { Observable } from 'rxjs';
import { BaseFormComponent } from '@shared/abstract/base-form/base-form.component';
import {
  BaseFormInputs,
  PublicationFormGroup,
} from '@shared/types/project-form.types';
import { UserService } from '@core/services/user.service';
import { AuthorNamePipe } from '@pipes/author-name.pipe';

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
  ],
  templateUrl: './project-publication-form.component.html',
  styleUrl: './project-publication-form.component.scss',
})
export class ProjectPublicationFormComponent
  extends BaseFormComponent
  implements OnInit
{
  private userService = inject(UserService);
  publicationsForm = input.required<PublicationFormGroup>();

  allUsers$!: Observable<BaseFormInputs['allUsers']>;

  ngOnInit(): void {
    this.allUsers$ = this.userService.getAllUsers();
  }

  compareAuthors = (id1: string, id2: string) => this.compareIds(id1, id2);

  getAuthorName(authorId: string, users: BaseFormInputs['allUsers']): string {
    const author = users?.find(
      (user) => user?.id.toString() === authorId.toString()
    );
    console.log('author', author);
    return author ? author.username : '';
  }
}
