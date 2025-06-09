import { inject, Injectable } from '@angular/core';
import { ProjectDataCoreService } from './project-data-core.service';
import { ResearchService } from '../models/research.service';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { catchError, Observable, throwError } from 'rxjs';
import {
  CreateResearchRequest,
  UpdateResearchRequest,
} from '@models/research.model';
import { statuses } from '@shared/content/project.content';

@Injectable({
  providedIn: 'root',
})
export class ResearchDataService extends ProjectDataCoreService {
  private readonly researchService = inject(ResearchService);

  create(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    try {
      const request = this.buildCreateRequest(projectId, formValues.research);
      return this.researchService
        .create(request)
        .pipe(catchError((error) => this.handleResearchError(error, 'create')));
    } catch (error) {
      return this.handleBuildError(error as Error);
    }
  }

  update(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    try {
      const typedProjectId = formValues.research?.id;
      if (!typedProjectId) {
        throw new Error('Research ID is required for update');
      }

      const request = this.buildUpdateRequest(
        projectId,
        formValues.research,
        typedProjectId
      );

      return this.researchService
        .update(typedProjectId, request)
        .pipe((error) => this.handleResearchError(error, 'update'));
    } catch (error) {
      return this.handleBuildError(error as Error);
    }
  }

  private buildCreateRequest(
    projectId: string,
    formValue: any
  ): CreateResearchRequest {
    return {
      projectId,
      participantIds: formValue.participantIds || [],
      budget: formValue.budget || 0,
      startDate: formValue.startDate?.toISOString() || new Date().toISOString(),
      endDate: formValue.endDate?.toISOString() || new Date().toISOString(),
      status: formValue.status || statuses[0].value,
      fundingSource: formValue.fundingSource || '',
    };
  }

  private buildUpdateRequest(
    projectId: string,
    formValue: any,
    id: string
  ): UpdateResearchRequest {
    const baseRequest = this.buildCreateRequest(projectId, formValue);
    return { ...baseRequest, id };
  }

  private handleResearchError(
    error: any,
    operation: string
  ): Observable<never> {
    const message =
      operation === 'create'
        ? 'Failed to create research record'
        : 'Failed to update research record';

    this.notificationService.showError(message);
    console.error(`Research ${operation} error:`, error);
    return throwError(() => error);
  }

  private handleBuildError(error: Error): Observable<never> {
    this.notificationService.showError(error.message);
    console.error('Research request build error:', error);
    return throwError(() => error);
  }
}
