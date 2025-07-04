import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationComponent } from './types/publication/publication.component';
import { ResearchProjectComponent } from './types/research-project/research-project.component';
import { PatentComponent } from './types/patent/patent.component';
import { HeaderService } from '@core/services/header.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe } from '@angular/common';
import { filter, finalize, Subscription, take } from 'rxjs';
import { getStatusOnProgess } from '@shared/utils/format.utils';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ProjectDTO } from '@models/project.model';
import { ProjectDetailsService } from '@core/services/project/project-details/project-details.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/authentication/auth.service';
import { ProjectCommentsComponent } from './components/project-comments/project-comments.component';
import { ProjectCommentService } from '@core/services/project/project-details/comments/project-comment.service';
import { ProjectAttachmentService } from '@core/services/project/project-details/attachments/project-attachment.service';
import { ProjectTagService } from '@core/services/project/project-details/tags/project-tag.service';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { LocalProjectTypePipe } from '@pipes/local-project-type.pipe';

@Component({
  selector: 'project-details',
  imports: [
    PublicationComponent,
    ResearchProjectComponent,
    PatentComponent,
    MatButton,
    MatProgressBarModule,
    MatIcon,
    DatePipe,
    TruncateTextPipe,
    MatButtonModule,
    FormsModule,
    MatProgressBarModule,
    ProjectCommentsComponent,
    LoaderComponent,
    LocalProjectTypePipe,
  ],
  templateUrl: './details.component.html',
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly projectDetailsService = inject(ProjectDetailsService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly projectCommentService = inject(ProjectCommentService);
  private readonly projectAttachmentService = inject(ProjectAttachmentService);
  private readonly projectTagService = inject(ProjectTagService);
  private readonly notificationService = inject(NotificationService);

  readonly workId = signal<string | null>(null);
  readonly projectLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly deleteLoading = signal(false);
  readonly isCurrentUserOwner = signal(false);

  readonly project = toSignal(this.projectDetailsService.project$);
  readonly attachments = toSignal(this.projectAttachmentService.attachments$);
  readonly tags = toSignal(this.projectTagService.tags$);

  readonly getStatusOnProgess = getStatusOnProgess;

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.workId.set(this.route.snapshot.params['id']);

    if (this.workId()) {
      console.log('Loading project with ID:', this.workId());
      this.loadProject();
    } else {
      this.notificationService.showError('Недійсний ідентифікатор проекту');
      this.router.navigate(['/projects/list']);
    }
  }

  private loadProject(): void {
    this.projectLoading.set(true);
    this.projectDetailsService.loadProjectDetails(this.workId()!);

    const sub = this.projectDetailsService.project$
      .pipe(
        filter((project) => project !== null),
        take(1)
      )
      .subscribe({
        next: (project) => {
          if (project) {
            this.handleProjectLoadSuccess(project);
          } else {
            this.notificationService.showError('Проєкт не знайдено');
            this.router.navigate(['/projects/list']);
          }
          this.projectLoading.set(false);
        },
        error: (error) => {
          this.handleProjectLoadError(error);
        },
      });

    this.subscriptions.push(sub);
  }

  private handleProjectLoadSuccess(project: ProjectDTO): void {
    this.updateHeader(project);
    const currentUserId = this.authService.getCurrentUserId();
    this.isCurrentUserOwner.set(currentUserId === project.createdBy);

    try {
      this.projectCommentService.refreshComments(project.id);
      this.projectTagService.loadTags(project.tagIds);
      this.projectAttachmentService.loadAttachments(project.type, project.id);
    } catch (error) {
      console.error('Error loading project dependencies:', error);
      this.notificationService.showError(
        'Не вдалося завантажити деякі деталі проекту'
      );
    }
  }

  private handleProjectLoadError(error: any): void {
    this.projectLoading.set(false);
    console.error('Project load error:', error);

    if (error.status === 404) {
      this.notificationService.showError('Проєкт не знайдено');
    } else if (error.status === 403) {
      this.notificationService.showError(
        'У вас немає дозволу на перегляд цього проєкту'
      );
    } else {
      this.notificationService.showError(
        'Не вдалося завантажити деталі проекту'
      );
    }

    this.router.navigate(['/projects/list']);
  }

  private updateHeader(project?: ProjectDTO): void {
    if (project) {
      const capitalizedType =
        project.type.charAt(0).toUpperCase() +
        project.type.slice(1).toLowerCase();
      this.headerService.setTitle(`${capitalizedType}: ${project.title}`);
    }
  }

  onEdit() {
    if (!this.workId()) return;

    this.router.navigate(['../create'], {
      relativeTo: this.route,
      queryParams: { id: this.workId() },
    });
  }

  onDelete() {
    if (!this.workId()) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        message:
          'Ви впевнені, що хочете видалити цей проєкт? Цю дію не можна скасувати.',
        // Are you sure you want to delete this project? This action cannot be undone.
      },
    });
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteProject();
      }
    });

    this.subscriptions.push(sub);
  }

  private deleteProject(): void {
    this.deleteLoading.set(true);

    const sub = this.projectDetailsService
      .deleteProject(this.workId()!)
      .pipe(finalize(() => this.deleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Проєкт успішно видалено');
          this.router.navigate(['/projects/list']);
        },
        error: (error) => {
          console.error('Delete project error:', error);

          if (error.status === 403) {
            this.notificationService.showError(
              'У вас немає дозволу на видалення цього проєкту'
            );
          } else {
            this.notificationService.showError('Не вдалося видалити проєкт');
          }
        },
      });

    this.subscriptions.push(sub);
  }

  goBack() {
    this.router.navigate(['/projects/list']);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.projectDetailsService.resetState();
  }
}
