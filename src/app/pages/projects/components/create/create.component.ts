import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HeaderService } from '../../../../core/services/header.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { AVAILABLE_PROJECT_TAGS } from '../../../../../../content/projects.content';
import { MultipleFileUploadComponent } from '../../../../shared/components/multiple-file-upload/multiple-file-upload.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Filter } from '../../../../shared/types/filters.types';

@Component({
  selector: 'project-creation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MultipleFileUploadComponent,
    MatAutocompleteModule,
    AsyncPipe,
    MatDatepickerModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
    provideNativeDateAdapter(),
  ],
})
export class CreateProjectComponent implements OnInit {
  private headerService = inject(HeaderService);
  subtext: string =
    'Choose the type of record you want to create and provide the required details.';

  types = [
    { value: 'publication', viewValue: 'Publication' },
    { value: 'patent', viewValue: 'Patent' },
    { value: 'research', viewValue: 'Research Project' },
  ];
  tags = AVAILABLE_PROJECT_TAGS;

  typeForm = new FormGroup({
    type: new FormControl('', [Validators.required]),
  });
  generalInformationForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    tags: new FormControl(['AI', 'Biotechnology', 'Sustainability']),
    attachments: new FormControl(['']),
  });
  publicationsForm = new FormGroup({
    authors: new FormControl([''], [Validators.required]),
    publicationDate: new FormControl(new Date(), [Validators.required]),
    publicationSource: new FormControl('', [Validators.required]),
    doiIsbn: new FormControl('', [Validators.required]),
    pages: new FormControl(10, [Validators.required]),
    journalVolume: new FormControl(1, [Validators.required]),
    issueNumbers: new FormControl(1, [Validators.required]),
  });
  patentsForm = new FormGroup({
    primaryAuthor: new FormControl('', [Validators.required]),
    coInventors: new FormControl(['']),
    registrationNumber: new FormControl(''),
    registrationDate: new FormControl(new Date()),
    issuingAuthority: new FormControl(''),
  });
  researchProjects = new FormGroup({
    participants: new FormControl([''], [Validators.required]),
    budget: new FormControl(0, [Validators.required]),
    startDate: new FormControl(new Date(), [Validators.required]),
    endDate: new FormControl(new Date(), [Validators.required]),
    status: new FormControl('', [Validators.required]),
    fundingSource: new FormControl('', [Validators.required]),
  });

  authors: string[] = [
    'Dmytro Krapyvianskyi',
    'Amelia Kastelik',
    'John Doe',
    'Michael Jackson',
  ];
  filteredAuthors!: Observable<string[]>;
  filteredPrimaryAuthors!: Observable<string[]>;
  filteredParticipants!: Observable<string[]>;

  statuses: Filter[] = [
    { value: 'proposed', viewValue: 'Proposed' },
    { value: 'in-progress', viewValue: 'In Progress' },
    { value: 'completed', viewValue: 'Completed' },
    { value: 'cancelled', viewValue: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.headerService.setTitle('Create New Entry');

    this.filteredAuthors =
      this.publicationsForm.controls.authors.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(typeof value === 'string' ? value : ''))
      );

    this.filteredPrimaryAuthors =
      this.patentsForm.controls.primaryAuthor.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      );

    this.filteredParticipants =
      this.researchProjects.controls.participants.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(typeof value === 'string' ? value : ''))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.authors.filter((author) =>
      author.toLowerCase().includes(filterValue)
    );
  }

  saveDraft() {
    console.log('Draft saved');
  }

  submitForm() {
    console.log('Form submitted');
  }
}
