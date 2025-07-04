import { Injectable, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FileMetadataDTO } from '@models/file.model';
import { ResponseUserDTO } from '@models/user.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { GeneralInformationForm } from '@shared/types/forms/project-form.types';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectFormCoreService {
  loading = new BehaviorSubject<boolean>(false);
  isEditing = false;
  creatorId: number | null = null;
  authors: ResponseUserDTO[] = [];

  createTypeForm(): FormGroup {
    return new FormGroup({
      type: new FormControl<ProjectType | null>(null, [Validators.required]),
    });
  }

  createGeneralInfoForm(): FormGroup<GeneralInformationForm> {
    return new FormGroup({
      title: new FormControl<string>('', [Validators.required]),
      description: new FormControl<string>('', [Validators.required]),
      progress: new FormControl<number>(0, [
        Validators.min(0),
        Validators.max(100),
      ]),
      tags: new FormControl<string[]>([]),
      attachments: new FormControl<(File | FileMetadataDTO)[]>([]),
    });
  }

  patchTypeForm(form: FormGroup, type: ProjectType) {
    if (!form) return;
    form.patchValue({ type }, { emitEvent: false });
    form.disable({ emitEvent: false });
    form.markAsPristine();
    form.markAsUntouched();
    form.updateValueAndValidity();
  }

  patchGeneralInformationForm(form: FormGroup, project: any): void {
    const { title, description, progress, tagIds, attachments } = project;

    form.patchValue(
      {
        title,
        description,
        progress,
        tags: tagIds,
        attachments: Array.isArray(attachments) ? [...attachments] : [],
      },
      {
        emitEvent: false,
      }
    );

    form.markAsTouched();
    form.updateValueAndValidity();
  }
}
