import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationComponent } from './types/publication/publication.component';
import { ResearchProjectComponent } from './types/research-project/research-project.component';
import { PatentComponent } from './types/patent/patent.component';

import { HeaderService } from '@core/services/header.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import { getStatusOnProgess } from '@shared/utils/format.utils';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { MatButtonModule } from '@angular/material/button';
import { ICreateComment } from '@models/comment.types';
import { FormsModule } from '@angular/forms';
import { ProjectDTO } from '@models/project.model';
import { ProjectDetailsService } from '@core/services/project/project-details/project-details.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '../../../../shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/authentication/auth.service';
import { ProjectCommentsComponent } from './components/project-comments/project-comments.component';
import { ProjectCommentService } from '@core/services/project/project-details/comments/project-comment.service';
import { ProjectAttachmentService } from '@core/services/project/project-details/attachments/project-attachment.service';
import { ProjectTagService } from '@core/services/project/project-details/tags/project-tag.service';

@Component({
  selector: 'project-details',
  imports: [
    PublicationComponent,
    ResearchProjectComponent,
    PatentComponent,
    MatButton,
    MatProgressBarModule,
    MatIcon,
    CommentComponent,
    TitleCasePipe,
    DatePipe,
    TruncateTextPipe,
    MatButtonModule,
    FormsModule,
    MatProgressBarModule,
    ProjectCommentsComponent,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
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

  // Signals
  readonly workId = signal<string | null>(null);
  readonly projectLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly deleteLoading = signal(false);
  readonly isCurrentUserOwner = signal(false);

  readonly project = toSignal(this.projectDetailsService.project$);
  readonly attachments = toSignal(this.projectAttachmentService.attachments$);
  readonly tags = toSignal(this.projectTagService.tags$);

  readonly getStatusOnProgess = getStatusOnProgess;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.workId.set(this.route.snapshot.params['id']);

    if (this.workId()) {
      console.log('Loading project with ID:', this.workId());
      this.loadProject();
    }
  }

  private loadProject(): void {
    this.projectLoading.set(true);
    this.projectLoading.set(false);

    this.projectDetailsService.loadProjectDetails(this.workId()!);

    const sub = this.projectDetailsService.project$.pipe().subscribe({
      next: (project) => {
        if (project) {
          this.updateHeader(project);
          const currentUserId = this.authService.getCurrentUserId();
          this.isCurrentUserOwner.set(currentUserId === project.createdBy);

          this.projectCommentService.refreshComments(project.id);
          this.projectTagService.loadTags(project.tagIds);
          this.projectAttachmentService.loadAttachments(
            project.type,
            project.id
          );
        }
        this.projectLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.projectLoading.set(false);
        this.errorMessage.set('Failed to load project details');
      },
    });

    this.subscriptions.push(sub);
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
        this.deleteLoading.set(true);
        this.projectDetailsService
          .deleteProject(this.workId()!)
          .pipe(
            finalize(() => {
              this.deleteLoading.set(false);
            })
          )
          .subscribe({
            next: () => this.router.navigate(['/projects/list']),
            error: (err) => {
              console.error('Error deleting project:', err);
              this.errorMessage.set('Failed to delete project');
            },
          });
      }
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.projectDetailsService.resetState();
  }
}
