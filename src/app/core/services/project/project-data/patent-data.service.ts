import { inject, Injectable } from '@angular/core';
import { ProjectDataCoreService } from './project-data-core.service';
import { CreatePatentRequest, UpdatePatentRequest } from '@models/patent.model';
import { PatentService } from '../models/patent.service';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatentDataService extends ProjectDataCoreService {
  private readonly patentService = inject(PatentService);

  create(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    return this.patentService.createPatent(
      this.buildCreateRequest(projectId, formValues.patent)
    );
  }

  update(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    const typedProjectId = formValues.patent?.id;
    if (!typedProjectId) throw new Error('Patent ID is required for update');

    return this.patentService.updatePatent(
      typedProjectId,
      this.buildUpdateRequest(projectId, formValues.patent, typedProjectId)
    );
  }

  private buildCreateRequest(
    projectId: string,
    formValue: any
  ): CreatePatentRequest {
    if (!formValue?.primaryAuthor) {
      throw new Error('Primary author is required');
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
