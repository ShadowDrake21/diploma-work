import { inject, Injectable } from '@angular/core';
import { ProjectFormService } from '../project-form/project-form.service';
import { FormGroup } from '@angular/forms';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectSubmissionService {
  private projectFormService = inject(ProjectFormService);
  private notificationService = inject(NotificationService);

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
      return 'A project with similar details already exists';
    }
    if (error.status === 400) {
      return 'Invalid project data. Please check your inputs';
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action';
    }
    return projectId
      ? `Failed to update project. Please try again.`
      : `Failed to create project. Please try again.`;
  }
}
