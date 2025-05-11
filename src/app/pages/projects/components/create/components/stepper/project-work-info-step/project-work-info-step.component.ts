import { Component, input } from '@angular/core';
import { ProjectPublicationFormComponent } from '../../project-publication-form/project-publication-form.component';
import { ProjectPatentFormComponent } from '../../project-patent-form/project-patent-form.component';
import { ProjectResearchFormComponent } from '../../project-research-form/project-research-form.component';
import { FormGroup } from '@angular/forms';
import {
  PatentFormGroup,
  PublicationFormGroup,
  ResearchFormGroup,
} from '@shared/types/project-form.types';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'create-project-work-info-step',
  imports: [
    ProjectPublicationFormComponent,
    ProjectPatentFormComponent,
    ProjectResearchFormComponent,
    JsonPipe,
  ],
  styleUrl: './project-work-info-step.component.scss',
  templateUrl: './project-work-info-step.component.html',
})
export class ProjectWorkInfoStepComponent {
  typeForm = input.required<FormGroup>();
  publicationsForm = input<PublicationFormGroup | null>(null, {
    alias: 'publicationsForm',
  });
  patentsForm = input<PatentFormGroup | null>(null, {
    alias: 'patentsForm',
  });
  researchesForm = input<ResearchFormGroup | null>(null, {
    alias: 'researchesForm',
  });
  authors = input.required<any[] | null>({ alias: 'authors' });
}
