import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Pipe({
  name: 'workForm',
  pure: true,
})
export class WorkFormPipe implements PipeTransform {
  transform(
    type: string,
    publicationForm: FormGroup,
    patentForm: FormGroup,
    researchForm: FormGroup
  ): FormGroup {
    switch (type) {
      case 'PUBLICATION':
        return publicationForm;
      case 'PATENT':
        console.log('Patent form accessed via pipe');
        return patentForm;
      case 'RESEARCH':
        return researchForm;
      default:
        return publicationForm;
    }
  }
}
