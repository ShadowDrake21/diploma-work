import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectService } from '../models/project.service';

@Injectable({
  providedIn: 'root',
})
export class TypedProjectsService {
  private projectService = inject(ProjectService);

  getPublication(projectId: string): Observable<any> {
    return this.projectService.getPublicationByProjectId(projectId);
  }

  getPatent(projectId: string): Observable<any> {
    return this.projectService.getPatentByProjectId(projectId);
  }

  getResearch(projectId: string): Observable<any> {
    return this.projectService.getResearchByProjectId(projectId);
  }
}
