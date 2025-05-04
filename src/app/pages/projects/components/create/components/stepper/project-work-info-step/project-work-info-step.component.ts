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

@Component({
  selector: 'create-project-work-info-step',
  imports: [
    ProjectPublicationFormComponent,
    ProjectPatentFormComponent,
    ProjectResearchFormComponent,
  ],
  styleUrl: './project-work-info-step.component.scss',
  template: ` @if(typeForm().value.type === 'PUBLICATION' && publicationsForm())
    {
    <create-project-publication-form
      [publicationsForm]="publicationsForm()!"
      [allUsers]="allUsers()"
      [authors]="authors()"
    />
    } @else if(typeForm().value.type === 'PATENT' && patentsForm()) {
    <create-project-patent-form
      [patentsForm]="patentsForm()!"
      [authors]="authors()"
      [allUsers]="allUsers()"
    />
    } @else if (typeForm().value.type === 'RESEARCH' && researchesForm()) {
    <create-project-research-form
      [researchesForm]="researchesForm()!"
      [allUsers]="allUsers()"
      [authors]="authors()"
    />
    }`,
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
  allUsers = input.required<any[] | null>({ alias: 'allUsers' });
  authors = input.required<any[] | null>({ alias: 'authors' });
}
