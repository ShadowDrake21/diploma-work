import { inject, Injectable } from '@angular/core';
import { ProjectFormService } from '../project-form/project-form.service';
import { FormGroup } from '@angular/forms';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectSubmissionService {
  private readonly projectFormService = inject(ProjectFormService);
  private readonly notificationService = inject(NotificationService);

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
        catchError((error) => {
          const errorMessage = this.getSubmissionErrorMessage(error, projectId);
          this.notificationService.showError(errorMessage);
          console.error('Project submission error:', error);
          return throwError(() => new Error(errorMessage));
        }),
        finalize(() => {
          this.projectFormService.loading.next(false);
        })
      );
  }

  private getSubmissionErrorMessage(
    error: any,
    projectId: string | null
  ): string {
    if (error.status === 409) {
      return 'Проєкт із подібними деталями вже існує';
    }
    if (error.status === 400) {
      return 'Недійсні дані проєкту. Будь ласка, перевірте введені дані.';
    }
    if (error.status === 403) {
      return 'У вас немає дозволу на виконання цієї дії';
    }
    return projectId
      ? `Не вдалося оновити проєкт. Спробуйте ще раз.`
      : `Не вдалося створити проєкт. Спробуйте ще раз.`;
  }
}
