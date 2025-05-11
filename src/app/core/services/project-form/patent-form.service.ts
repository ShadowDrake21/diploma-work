import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectFormCoreService } from './project-form-core.service';

@Injectable({
  providedIn: 'root',
})
export class PatentFormService extends ProjectFormCoreService {
  createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl<string | null>(null),
      primaryAuthor: new FormControl<string | null>(null, [
        Validators.required,
      ]),
      coInventors: new FormControl<number[]>([]),
      registrationNumber: new FormControl<string>('', Validators.required),
      registrationDate: new FormControl<Date | null>(
        new Date(),
        Validators.required
      ),
      issuingAuthority: new FormControl<string>('', Validators.required),
    });
  }

  patchForm(form: FormGroup, patent: any): void {
    const {
      id,
      primaryAuthorId,
      coInventors,
      registrationNumber,
      registrationDate,
      issuingAuthority,
    } = patent;

    form.patchValue({
      id,
      primaryAuthor: primaryAuthorId?.toString(),
      coInventors,
      registrationNumber,
      registrationDate: new Date(registrationDate),
      issuingAuthority,
    });
  }
}
