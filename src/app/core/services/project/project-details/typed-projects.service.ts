import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ProjectService } from '../models/project.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { ResearchDTO } from '@models/research.model';
import { PatentDTO } from '@models/patent.model';
import { PublicationDTO } from '@models/publication.model';

@Injectable({
  providedIn: 'root',
})
export class TypedProjectsService {
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);

  getPublication(projectId: string): Observable<PublicationDTO | null> {
    return this.projectService.getPublicationByProjectId(projectId).pipe(
      catchError((error) => {
        console.error('Error loading publication:', error);
        this.notificationService.showError(
          'Не вдалося завантажити деталі публікації'
        );
        return of(null);
      }),
      map((response) => response || null)
    );
  }

  getPatent(projectId: string): Observable<PatentDTO | null> {
    return this.projectService.getPatentByProjectId(projectId).pipe(
      catchError((error) => {
        console.error('Error loading patent:', error);
        this.notificationService.showError(
          'Не вдалося завантажити інформацію про патент'
        );
        return of(null);
      }),
      map((response) => response || null)
    );
  }

  getResearch(projectId: string): Observable<ResearchDTO | null> {
    return this.projectService.getResearchByProjectId(projectId).pipe(
      catchError((error) => {
        console.error('Error loading research:', error);
        this.notificationService.showError(
          'Не вдалося завантажити деталі дослідження'
        );
        return of(null);
      })
    );
  }

  getTypedProject<T>(
    projectId: string,
    type: ProjectType
  ): Observable<T | null> {
    const methodMap = {
      [ProjectType.PUBLICATION]: this.getPublication.bind(this),
      [ProjectType.PATENT]: this.getPatent.bind(this),
      [ProjectType.RESEARCH]: this.getResearch.bind(this),
    };

    if (!methodMap[type]) {
      const error = new Error(`Недійсний тип проекту: ${type}`);
      console.error(error);
      this.notificationService.showError('Недійсний тип проекту');
      return of(null);
    }

    return methodMap[type](projectId) as Observable<T | null>;
  }
}
