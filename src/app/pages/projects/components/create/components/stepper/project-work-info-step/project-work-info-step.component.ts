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
  template: ` @let typeForm = typeFormSig(); @let publicationsForm =
    publicationsFormSig(); @let patentsForm = patentsFormSig(); @let
    researchesForm = researchesFormSig(); @let allUsers = allUsersSig(); @let
    authors = authorsSig(); @if(typeForm?.value.type === 'PUBLICATION' &&
    publicationsForm) {
    <create-project-publication-form
      [publicationsForm]="publicationsForm"
      [allUsers]="allUsers"
      [authors]="authors"
    />
    } @else if(typeForm?.value.type === 'PATENT' && patentsForm) {
    <create-project-patent-form
      [patentsForm]="patentsForm"
      [authors]="authors"
      [allUsers]="allUsers"
    />
    } @else if (typeForm?.value.type === 'RESEARCH' && researchesForm) {
    <create-project-research-form
      [researchesForm]="researchesForm"
      [allUsers]="allUsers"
      [authors]="authors"
    />
    }`,
})
export class ProjectWorkInfoStepComponent {
  typeFormSig = input<FormGroup | null>(null, { alias: 'typeForm' });
  publicationsFormSig = input<PublicationFormGroup | null>(null, {
    alias: 'publicationsForm',
  });
  patentsFormSig = input<PatentFormGroup | null>(null, {
    alias: 'patentsForm',
  });
  researchesFormSig = input<ResearchFormGroup | null>(null, {
    alias: 'researchesForm',
  });
  allUsersSig = input.required<any[] | null>({ alias: 'allUsers' });
  authorsSig = input.required<any[] | null>({ alias: 'authors' });
}
