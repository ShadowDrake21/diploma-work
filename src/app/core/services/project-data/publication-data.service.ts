import { inject, Injectable } from '@angular/core';
import { PublicationService } from '../publication.service';
import { TypedProjectFormValues } from '@shared/types/services/project-data.types';
import { Observable } from 'rxjs';
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
    return this.publicationService.createPublication(
      this.buildCreateRequest(projectId, formValues.publication)
    );
  }

  update(
    projectId: string,
    formValues: TypedProjectFormValues
  ): Observable<any> {
    const typedProjectId = formValues.publication?.id;
    if (!typedProjectId)
      throw new Error('Publication ID is required for update');

    return this.publicationService.updatePublication(
      typedProjectId,
      this.buildUpdateRequest(projectId, formValues.publication, typedProjectId)
    );
  }

  private buildCreateRequest(
    projectId: string,
    formValue: any,
    id?: string
  ): CreatePublicationRequest {
    if (!formValue?.publicationDate) {
      throw new Error('Publication date is required');
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
}
