import { Component, input, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  BaseFormInputs,
  ProjectFormGroup,
} from '@shared/types/project-form.types';

@Component({
  template: '',
})
export abstract class BaseFormComponent {
  allUsersSig = input.required<BaseFormInputs['allUsers']>({
    alias: 'allUsers',
  });
  authorsSig = input.required<BaseFormInputs['authors']>({ alias: 'authors' });

  compareIds(id1: string | number, id2: string | number): boolean {
    return id1?.toString() === id2?.toString();
  }
}
