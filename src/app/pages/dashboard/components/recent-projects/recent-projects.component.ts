import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { ProjectDTO } from '@models/project.model';
import { map, Subject, takeUntil, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'dashboard-recent-projects',
  imports: [
    MatIcon,
    MatProgressSpinnerModule,
    ProjectCardComponent,
    LoaderComponent,
  ],
  templateUrl: './recent-projects.component.html',
})
export class RecentProjectsComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);
  projects = signal<ProjectDTO[]>([]);

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading.set(true);
    this.hasError.set(false);
    return this.projectService
      .getNewestProjects(6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          if (projects.success) {
            console.log('Loaded recent projects:', projects);
            this.projects.set(projects.data || []);
            this.isLoading.set(false);
          } else {
            console.error('Failed to load recent projects:', projects);
            this.hasError.set(true);
            this.errorMessage.set(projects.message || 'Невідома помилка');
            this.notificationService.showError(
              projects.message || 'Не вдалося завантажити останні проекти'
            );
            this.isLoading.set(false);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.handleProjectLoadError(error);
          this.isLoading.set(false);
        },
      });
  }

  private handleProjectLoadError(error: HttpErrorResponse): void {
    console.error('Error loading projects:', error);

    let message = 'Не вдалося завантажити останні проекти';
    if (error.status === 0) {
      message = 'Помилка мережі: Перевірте підключення до Інтернету';
    } else if (error.status === 404) {
      message = 'Не знайдено останніх проектів';
    }

    this.errorMessage.set(message);
    this.notificationService.showError(message);
    this.projects.set([]);
  }

  retryLoading() {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
