import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectFormCoreService } from './project-form-core.service';
import { statuses } from '@content/createProject.content';

@Injectable({
  providedIn: 'root',
})
export class ResearchFormService extends ProjectFormCoreService {
  createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl<string | null>(null),
      participantIds: new FormControl<string[] | null>(
        [],
        [Validators.required]
      ),
      budget: new FormControl<number | null>(0, [
        Validators.required,
        Validators.min(0),
      ]),
      startDate: new FormControl<Date | null>(new Date(), [
        Validators.required,
      ]),
      endDate: new FormControl<Date | null>(new Date(), [Validators.required]),
      status: new FormControl<string | null>(statuses[0].value, [
        Validators.required,
      ]),
      fundingSource: new FormControl<string>('', [Validators.required]),
    });
  }

  patchForm(form: FormGroup, research: any): void {
    const {
      id,
      participantIds,
      budget,
      startDate,
      endDate,
      status,
      fundingSource,
    } = research;

    form.patchValue({
      id,
      participantIds,
      budget,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      fundingSource,
    });
  }
}
