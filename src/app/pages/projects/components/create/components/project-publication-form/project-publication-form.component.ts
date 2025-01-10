import { AsyncPipe, CommonModule } from '@angular/common';
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
import { map, Observable, startWith } from 'rxjs';
import { CreateWorkService } from '@core/services/create-work.service';

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
    AsyncPipe,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  templateUrl: './project-publication-form.component.html',
  styleUrl: './project-publication-form.component.scss',
})
export class ProjectPublicationFormComponent implements OnInit {
  private createWorkService = inject(CreateWorkService);

  publicationsFormSig = input.required<
    FormGroup<{
      authors: FormControl<string[] | null>;
      publicationDate: FormControl<Date | null>;
      publicationSource: FormControl<string | null>;
      doiIsbn: FormControl<string | null>;
      startPage: FormControl<number | null>;
      endPage: FormControl<number | null>;
      journalVolume: FormControl<number | null>;
      issueNumbers: FormControl<number | null>;
    }>
  >({ alias: 'publicationForm' });

  filteredAuthors!: Observable<string[]>;

  ngOnInit(): void {
    this.filteredAuthors =
      this.publicationsFormSig().controls.authors.valueChanges.pipe(
        startWith(''),
        map((value) =>
          this.createWorkService._filter(typeof value === 'string' ? value : '')
        )
      );
  }
}
