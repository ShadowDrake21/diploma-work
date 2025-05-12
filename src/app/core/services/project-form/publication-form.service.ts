import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PublicationDTO } from '@models/publication.model';
import { ProjectFormCoreService } from './project-form-core.service';

@Injectable({
  providedIn: 'root',
})
export class PublicationFormService extends ProjectFormCoreService {
  createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl<string | null>(null),
      authors: new FormControl<string[]>([], [Validators.required]),
      publicationDate: new FormControl<Date | null>(new Date(), [
        Validators.required,
      ]),
      publicationSource: new FormControl<string>('', [Validators.required]),
      doiIsbn: new FormControl<string>('', [Validators.required]),
      startPage: new FormControl<number>(1, [
        Validators.required,
        Validators.min(1),
      ]),
      endPage: new FormControl<number>(10, [
        Validators.required,
        Validators.min(1),
      ]),
      journalVolume: new FormControl<number>(1, [
        Validators.required,
        Validators.min(1),
      ]),
      issueNumber: new FormControl<number>(1, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  patchForm(form: FormGroup, publication: PublicationDTO): void {
    const {
      id,
      publicationDate,
      publicationSource,
      doiIsbn,
      startPage,
      endPage,
      journalVolume,
      issueNumber,
      authors,
    } = publication;

    form.patchValue({
      id,
      authors: authors.map((a) => a.id),
      publicationDate: new Date(publicationDate),
      publicationSource,
      doiIsbn,
      startPage,
      endPage,
      journalVolume,
      issueNumber,
    });
  }
}
