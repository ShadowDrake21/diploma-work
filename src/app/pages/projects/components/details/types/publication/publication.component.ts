import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { PublicationDTO } from '@models/publication.model';
import { catchError, Observable, of } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'details-publication',
  imports: [DatePipe, AsyncPipe, MatProgressBarModule, MatExpansionModule],
  templateUrl: './publication.component.html',
})
export class PublicationComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true })
  id!: string;

  publication$!: Observable<PublicationDTO | null>;
  error = false;

  ngOnInit(): void {
    this.publication$ = this.projectService
      .getPublicationByProjectId(this.id)
      .pipe(
        catchError((error) => {
          this.error = true;
          this.notificationService.showError(
            'Failed to load publication details'
          );
          console.error('Publication load error:', error);
          return of(null);
        })
      );
  }
}
