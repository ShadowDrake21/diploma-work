import { inject, Injectable } from '@angular/core';
import { ProjectDataCoreService } from './project-data-core.service';
import { ResearchService } from '../research.service';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { Observable } from 'rxjs';
import {
  CreateResearchRequest,
  UpdateResearchRequest,
} from '@models/research.model';
import { statuses } from '@content/createProject.content';

@Injectable({
  providedIn: 'root',
})
export class ResearchDataService extends ProjectDataCoreService {
  private readonly researchService = inject(ResearchService);

  create(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    return this.researchService.create(
      this.buildCreateRequest(projectId, formValues.research)
    );
  }

  update(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    const typedProjectId = formValues.research?.id;
    if (!typedProjectId) throw new Error('Research ID is required for update');

    return this.researchService.update(
      typedProjectId,
      this.buildUpdateRequest(projectId, formValues.research, typedProjectId)
    );
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
}
