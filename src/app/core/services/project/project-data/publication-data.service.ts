import { inject, Injectable } from '@angular/core';
import { PublicationService } from '../models/publication.service';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { catchError, Observable, throwError } from 'rxjs';
import { ProjectDataCoreService } from './project-data-core.service';
import {
  CreatePublicationRequest,
  UpdatePublicationRequest,
} from '@models/publication.model';

@Injectable({
  providedIn: 'root',
})
export class PublicationDataService extends ProjectDataCoreService {
  private readonly publicationService = inject(PublicationService);

  create(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    try {
      const request = this.buildCreateRequest(
        projectId,
        formValues.publication
      );
      return this.publicationService
        .createPublication(request)
        .pipe(
          catchError((error) => this.handlePublicationError(error, 'create'))
        );
    } catch (error) {
      return this.handleBuildError(error as Error);
    }
  }

  update(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    try {
      const typedProjectId = formValues.publication?.id;
      if (!typedProjectId) {
        throw new Error('Для оновлення потрібен ідентифікатор публікації');
      }

      const request = this.buildUpdateRequest(
        projectId,
        formValues.publication,
        typedProjectId
      );

      return this.publicationService
        .updatePublication(typedProjectId, request)
        .pipe(
          catchError((error) => this.handlePublicationError(error, 'update'))
        );
    } catch (error) {
      return this.handleBuildError(error as Error);
    }
  }

  private buildCreateRequest(
    projectId: string,
    formValue: any,
    id?: string
  ): CreatePublicationRequest {
    if (!formValue?.publicationDate) {
      throw new Error('Потрібно вказати дату публікації');
    }

    return {
      projectId,
      publicationDate: new Date(formValue.publicationDate!).toISOString(),
      publicationSource: formValue.publicationSource ?? '',
      doiIsbn: formValue.doiIsbn ?? '',
      startPage: formValue.startPage ?? 1,
      endPage: formValue.endPage ?? 1,
      journalVolume: formValue.journalVolume ?? 1,
      issueNumber: formValue.issueNumber ?? 1,
      authors:
        formValue.authors?.map((author: string) => parseInt(author)) || [],
    };
  }

  private buildUpdateRequest(
    projectId: string,
    formValue: any,
    id: string
  ): UpdatePublicationRequest {
    const baseRequest = this.buildCreateRequest(projectId, formValue);
    return { ...baseRequest, id };
  }

  private handlePublicationError(
    error: any,
    operation: string
  ): Observable<never> {
    const message =
      operation === 'create'
        ? 'Не вдалося створити запис публікації'
        : 'Не вдалося оновити запис публікації';

    this.notificationService.showError(message);
    console.error(`Publication ${operation} error:`, error);
    return throwError(() => error);
  }

  private handleBuildError(error: Error): Observable<never> {
    this.notificationService.showError(error.message);
    console.error('Publication request build error:', error);
    return throwError(() => error);
  }
}
