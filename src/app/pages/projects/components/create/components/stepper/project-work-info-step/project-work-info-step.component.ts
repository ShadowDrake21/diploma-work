import { Component, input } from '@angular/core';
import { ProjectPublicationFormComponent } from '../../project-publication-form/project-publication-form.component';
import { ProjectPatentFormComponent } from '../../project-patent-form/project-patent-form.component';
import { ProjectResearchFormComponent } from '../../project-research-form/project-research-form.component';
import { FormGroup } from '@angular/forms';
import {
  PatentFormGroup,
  PublicationFormGroup,
  ResearchFormGroup,
} from '@shared/types/forms/project-form.types';

@Component({
  selector: 'create-project-work-info-step',
  imports: [
    ProjectPublicationFormComponent,
    ProjectPatentFormComponent,
    ProjectResearchFormComponent,
  ],
  templateUrl: './project-work-info-step.component.html',
  styleUrl: './project-work-info-step.component.scss',
})
export class ProjectWorkInfoStepComponent {
  typeForm = input.required<FormGroup>();
  publicationsForm = input<PublicationFormGroup | null>(null);
  patentsForm = input<PatentFormGroup | null>(null);
  researchesForm = input<ResearchFormGroup | null>(null);
  authors = input<any[]>([]);
}
