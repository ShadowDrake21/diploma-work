import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { catchError, Observable, of } from 'rxjs';

@Component({
  selector: 'details-publication',
  imports: [DatePipe, AsyncPipe],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss',
})
export class PublicationComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true })
  id!: string;

  publication$!: Observable<any>;
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
