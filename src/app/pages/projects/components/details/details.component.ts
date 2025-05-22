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
import { ICreateComment } from '@shared/types/comment.types';
import { FormsModule } from '@angular/forms';
import { ProjectDTO } from '@models/project.model';
import { ProjectDetailsService } from '@core/services/project/project-details/project-details.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly projectDetailsService = inject(ProjectDetailsService);
  private readonly dialog = inject(MatDialog);

  // Signals
  readonly workId = signal<string | null>(null);
  readonly projectLoading = signal(false);
  readonly commentsLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly newCommentContent = signal('');
  readonly replyingToCommentId = signal<string | null>(null);
  readonly replyContent = signal('');
  readonly deleteLoading = signal(false);

  readonly project = toSignal(this.projectDetailsService.project$);
  readonly publication = toSignal(this.projectDetailsService.publication$);
  readonly patent = toSignal(this.projectDetailsService.patent$);
  readonly research = toSignal(this.projectDetailsService.research$);
  readonly comments = toSignal(this.projectDetailsService.comments$);
  readonly attachments = toSignal(this.projectDetailsService.attachments$);
  readonly tags = toSignal(this.projectDetailsService.tags$);

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
        this.updateHeader(project);
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
    } else {
      this.headerService.setTitle('Project Details');
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

  postComment() {
    if (!this.workId() || !this.newCommentContent().trim()) return;

    const comment: ICreateComment = {
      content: this.newCommentContent(),
      projectId: this.workId()!,
      parentCommentId: this.replyingToCommentId()! || undefined,
    };

    this.projectDetailsService.postComment(comment, () => {
      this.newCommentContent.set('');
      this.replyingToCommentId.set(null);
    });
  }

  postReply(parentCommentId: string) {
    if (!this.replyContent().trim()) return;

    const comment: ICreateComment = {
      content: this.replyContent(),
      projectId: this.workId()!,
      parentCommentId,
    };

    this.projectDetailsService.postComment(comment, () => {
      this.replyContent.set('');
    });
  }

  onCommentLikeToggle([action, commentId]: ['like' | 'unlike', string]): void {
    const serviceCall =
      action === 'like'
        ? this.projectDetailsService.likeComment(commentId)
        : this.projectDetailsService.unlikeComment(commentId);

    serviceCall.subscribe({
      error: (err) => console.error(`Error ${action} comment:`, err),
    });
  }

  onCommentEdit(commentId: string, newContent: string): void {
    this.commentsLoading.set(true);
    const sub = this.projectDetailsService
      .updateComment(commentId, newContent)
      .pipe(finalize(() => this.commentsLoading.set(false)))
      .subscribe({
        error: (err) => console.error('Error updating comment:', err),
      });

    this.subscriptions.push(sub);
  }

  onCommentDelete(commentId: string): void {
    this.commentsLoading.set(true);
    const sub = this.projectDetailsService
      .deleteComment(commentId)
      .pipe(finalize(() => this.commentsLoading.set(false)))
      .subscribe({
        error: (err) => console.error('Error deleting comment:', err),
      });

    this.subscriptions.push(sub);
  }

  startReply(commentId: string) {
    this.replyingToCommentId.set(commentId);
  }

  cancelReply() {
    this.replyingToCommentId.set(null);
    this.replyContent.set('');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.projectDetailsService.resetState();
  }
}
