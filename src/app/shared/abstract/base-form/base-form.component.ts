import { Component, input } from '@angular/core';
import { BaseFormInputs } from '@shared/types/forms/project-form.types';

@Component({
  template: '',
})
export abstract class BaseFormComponent {
  authors = input.required<BaseFormInputs['authors']>();

  compareIds(id1: string | number, id2: string | number): boolean {
    return id1?.toString() === id2?.toString();
  }
}
