import { Component, inject, input } from '@angular/core';
import { ProjectTypeComponent } from '../../project-type/project-type.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'create-project-type-step',
  imports: [ProjectTypeComponent],
  styleUrl: './project-type-step.component.scss',
  template: `
    @let typeForm = typeFormSig(); @if (typeForm) {
    <create-project-type [typeForm]="typeForm" />
    }
  `,
})
export class ProjectTypeStepComponent {
  typeFormSig = input<FormGroup | null>(null, { alias: 'typeForm' });
}
