import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
import { Observable } from 'rxjs';
import { BaseFormComponent } from '@shared/abstract/base-form/base-form.component';
import { PublicationFormGroup } from '@shared/types/project-form.types';

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
  ],
  templateUrl: './project-publication-form.component.html',
  styleUrl: './project-publication-form.component.scss',
})
export class ProjectPublicationFormComponent extends BaseFormComponent {
  publicationsFormSig = input.required<PublicationFormGroup>({
    alias: 'publicationsForm',
  });

  compareAuthors = (id1: string, id2: string) => this.compareIds(id1, id2);

  getAuthorName(authorId: string): string {
    const author = this.allUsersSig()?.find(
      (user) => user?.id.toString() === authorId.toString()
    );
    return author ? author.username : '';
  }
}
