import { CommonModule } from '@angular/common';
import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
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
export class ProjectPublicationFormComponent implements OnChanges {
  publicationsFormSig = input.required<
    FormGroup<{
      authors: FormControl<string[] | null>;
      publicationDate: FormControl<Date | null>;
      publicationSource: FormControl<string | null>;
      doiIsbn: FormControl<string | null>;
      startPage: FormControl<number | null>;
      endPage: FormControl<number | null>;
      journalVolume: FormControl<number | null>;
      issueNumber: FormControl<number | null>;
    }>
  >({ alias: 'publicationForm' });
  allUsersSig = input.required<any[] | null>({ alias: 'allUsers' });
  authorsSig = input.required<any[] | null>({ alias: 'authors' });

  // authors = authors;
  filteredAuthors!: Observable<string[]>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authorSig']) {
      this.publicationsFormSig().controls.authors.setValue(this.authorsSig());
    }
  }

  compareAuthors(authorId1: string, authorId2: string): boolean {
    console.log('authorId1', authorId1);
    console.log('authorId2', authorId2);
    console.log(
      'authorId1 === authorId2',
      authorId1.toString() === authorId2.toString()
    );
    return authorId1.toString() === authorId2.toString();
  }

  getAuthorName(authorId: string): string {
    const author = this.allUsersSig()?.find((user) => {
      return user.id.toString() === authorId.toString();
    });
    return author ? author.username : '';
  }
}
