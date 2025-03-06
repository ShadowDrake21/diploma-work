import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HeaderService } from '@core/services/header.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProjectTypeComponent } from './components/project-type/project-type.component';
import { ProjectGeneralInformationComponent } from './components/project-general-information/project-general-information.component';
import { ProjectPublicationFormComponent } from './components/project-publication-form/project-publication-form.component';
import { ProjectPatentFormComponent } from './components/project-patent-form/project-patent-form.component';
import { ProjectResearchFormComponent } from './components/project-research-form/project-research-form.component';
import { statuses, types } from '@content/createProject.content';
import { ProjectService } from '@core/services/project.service';
import { PatentService } from '@core/services/patent.service';
import { PublicationService } from '@core/services/publication.service';
import { ResearchService } from '@core/services/research.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { TagService } from '@core/services/tag.service';
import { UserService } from '@core/services/user.service';
import { Observable } from 'rxjs';

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
    MatAutocompleteModule,
    MatDatepickerModule,
    ProjectTypeComponent,
    ProjectGeneralInformationComponent,
    ProjectPublicationFormComponent,
    ProjectPatentFormComponent,
    ProjectResearchFormComponent,
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
  host: { style: 'display: block; height: 100%' },
})
export class CreateProjectComponent implements OnInit {
  private headerService = inject(HeaderService);
  private userService = inject(UserService);
  private projectService = inject(ProjectService);
  private publicationService = inject(PublicationService);
  private patentService = inject(PatentService);
  private researchService = inject(ResearchService);
  private attachmentsService = inject(AttachmentsService);

  subtext: string =
    'Choose the type of record you want to create and provide the required details.';

  types = types;
  statuses = statuses;

  allUsers$!: Observable<any[]>;

  typeForm = new FormGroup({
    type: new FormControl('', [Validators.required]),
  });
  generalInformationForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    progress: new FormControl(0, [Validators.min(0), Validators.max(100)]),
    tags: new FormControl(['']),
    attachments: new FormControl(['']),
  });
  publicationsForm = new FormGroup({
    authors: new FormControl(['15', '16'], [Validators.required]),
    publicationDate: new FormControl(new Date(), [Validators.required]),
    publicationSource: new FormControl('', [Validators.required]),
    doiIsbn: new FormControl('', [Validators.required]),
    startPage: new FormControl(10, [Validators.required]),
    endPage: new FormControl(20, [Validators.required]),
    journalVolume: new FormControl(1, [Validators.required]),
    issueNumber: new FormControl(1, [Validators.required]),
  });
  patentsForm = new FormGroup({
    primaryAuthor: new FormControl('', [Validators.required]),
    coInventors: new FormControl(['16']),
    registrationNumber: new FormControl(''),
    registrationDate: new FormControl(new Date()),
    issuingAuthority: new FormControl(''),
  });
  researchProjects = new FormGroup({
    participants: new FormControl(['15', '16'], [Validators.required]),
    budget: new FormControl(0, [Validators.required]),
    startDate: new FormControl(new Date(), [Validators.required]),
    endDate: new FormControl(new Date(), [Validators.required]),
    status: new FormControl(this.statuses[0], [Validators.required]),
    fundingSource: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.headerService.setTitle('Create New Entry');
    this.allUsers$ = this.userService.getAllUsers();
  }

  saveDraft() {
    console.log('Draft saved');
  }

  // TODO: Project-Tag table, entities don't save

  submitForm() {
    const selectedType = this.typeForm.value.type;
    const availableTypes = this.types.map((type) => type.value);
    const tags = this.generalInformationForm.value.tags;

    console.log('Selected type:', selectedType);
    console.log('Tags:', tags);

    const createProjecySub = this.projectService
      .createProject({
        title: this.generalInformationForm.value.title,
        description: this.generalInformationForm.value.description,
        type: selectedType,
        progress: this.generalInformationForm.value.progress,
        tags,
      })
      .subscribe((response) => {
        const projectId = response.id;

        if (selectedType === availableTypes[0]) {
          const authors = this.publicationsForm.value.authors?.map(
            (author: string) => parseInt(author)
          );
          this.publicationService
            .createPublication({
              projectId,
              ...this.publicationsForm.value,
              authors,
              publicationDate: new Date(
                this.publicationsForm.value.publicationDate!
              ).toISOString(),
            })
            .subscribe((response) =>
              console.log('Publication created:', response)
            );
        }

        if (selectedType === availableTypes[1]) {
          const coInventors = this.patentsForm.value.coInventors?.map(
            (coInventor: string) => parseInt(coInventor)
          );

          console.log('Co-inventors:', coInventors);

          this.patentService
            .createPatent({
              projectId,
              ...this.patentsForm.value,
              primaryAuthorId: 15,
              registrationDate: new Date(
                this.patentsForm.value.registrationDate!
              ).toISOString(),
              coInventors: coInventors?.length ? coInventors : null,
            })
            .subscribe((response) => console.log('Patent created:', response));
        }
        if (selectedType === availableTypes[2]) {
          const participants = this.researchProjects.value.participants?.map(
            (participant: string) => parseInt(participant)
          );

          console.log('Participants:', participants);
          this.researchService
            .createResearch({
              projectId,
              ...this.researchProjects.value,
              startDate: new Date(
                this.researchProjects.value.startDate!
              ).toISOString(),
              endDate: new Date(
                this.researchProjects.value.endDate!
              ).toISOString(),
              participants,
            })
            .subscribe((response) =>
              console.log('Research created:', response)
            );
        }
      });
  }
}
