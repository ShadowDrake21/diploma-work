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
  allUsers = input.required<BaseFormInputs['allUsers']>();
  authors = input.required<BaseFormInputs['authors']>();

  compareIds(id1: string | number, id2: string | number): boolean {
    return id1?.toString() === id2?.toString();
  }
}
