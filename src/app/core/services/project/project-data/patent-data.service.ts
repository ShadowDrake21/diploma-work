import { inject, Injectable } from '@angular/core';
import { ProjectDataCoreService } from './project-data-core.service';
import { CreatePatentRequest, UpdatePatentRequest } from '@models/patent.model';
import { PatentService } from '../models/patent.service';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatentDataService extends ProjectDataCoreService {
  private readonly patentService = inject(PatentService);

  create(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    try {
      const request = this.buildCreateRequest(projectId, formValues.patent);
      return this.patentService
        .createPatent(request)
        .pipe(catchError((error) => this.handlePatentError(error, 'create')));
    } catch (error) {
      return this.handleBuildError(error as Error);
    }
  }

  update(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    try {
      const typedProjectId = formValues.patent?.id;
      if (!typedProjectId)
        throw new Error('Для оновлення потрібен ідентифікатор патенту');

      const request = this.buildUpdateRequest(
        projectId,
        formValues.patent,
        typedProjectId
      );
      return this.patentService
        .updatePatent(typedProjectId, request)
        .pipe(catchError((error) => this.handlePatentError(error, 'update')));
    } catch (error) {
      return this.handleBuildError(error as Error);
    }
  }

  private handlePatentError(error: any, operation: string): Observable<never> {
    const message =
      operation === 'create'
        ? 'Не вдалося створити патентний запис'
        : 'Не вдалося оновити патентний запис';

    this.notificationService.showError(message);
    console.error(`Patent ${operation} error:`, error);
    return throwError(() => error);
  }

  private handleBuildError(error: Error): Observable<never> {
    this.notificationService.showError(error.message);
    console.error('Patent request build error:', error);
    return throwError(() => error);
  }

  private buildCreateRequest(
    projectId: string,
    formValue: any
  ): CreatePatentRequest {
    if (!formValue?.primaryAuthor) {
      throw new Error('Потрібно вказати основного автора');
    }

    return {
      projectId,
      primaryAuthorId: +formValue.primaryAuthor,
      registrationNumber: formValue.registrationNumber ?? '',
      registrationDate:
        formValue.registrationDate?.toISOString() ?? new Date().toISOString(),
      issuingAuthority: formValue.issuingAuthority ?? '',
      coInventors:
        formValue.coInventors?.map((inventor: any) => +inventor) || [],
    };
  }

  private buildUpdateRequest(
    projectId: string,
    formValue: any,
    id: string
  ): UpdatePatentRequest {
    const baseRequest = this.buildCreateRequest(projectId, formValue);
    return { ...baseRequest, id };
  }
}
