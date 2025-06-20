import { Component, input } from '@angular/core';
import { ProjectTypeComponent } from '../../project-type/project-type.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'create-project-type-step',
  imports: [ProjectTypeComponent],
  templateUrl: './project-type-step.component.html',
})
export class ProjectTypeStepComponent {
  typeForm = input.required<FormGroup>();
}
