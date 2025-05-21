import { inject, Injectable } from '@angular/core';
import { ProjectFormService } from '../project-form/project-form.service';
import { FormGroup } from '@angular/forms';
import { finalize, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectSubmissionService {
  private projectFormService = inject(ProjectFormService);

  submitProject(
    typeForm: FormGroup,
    generalInfoForm: FormGroup,
    workForm: FormGroup,
    projectId: string | null,
    creatorId: number,
    newFiles: File[]
  ): Observable<any> {
    this.projectFormService.loading.next(true);

    return this.projectFormService
      .submitForm(
        typeForm,
        generalInfoForm,
        workForm,
        projectId,
        creatorId,
        newFiles
      )
      .pipe(
        finalize(() => {
          this.projectFormService.loading.next(false);
        })
      );
  }
}
