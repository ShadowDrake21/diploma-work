import { Component, inject, input } from '@angular/core';
import { ProjectTypeComponent } from '../../project-type/project-type.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'create-project-type-step',
  imports: [ProjectTypeComponent],
  styleUrl: './project-type-step.component.scss',
  template: `
    @if (typeForm()) {
    <create-project-type [typeForm]="typeForm()" />
    }
  `,
})
export class ProjectTypeStepComponent {
  typeForm = input.required<FormGroup>();
}
