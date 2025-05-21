import { Component, inject, OnInit, signal } from '@angular/core';
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
import { finalize } from 'rxjs';
import { getStatusOnProgess } from '@shared/utils/format.utils';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { MatButtonModule } from '@angular/material/button';
import { ICreateComment } from '@shared/types/comment.types';
import { FormsModule } from '@angular/forms';
import { ProjectDTO } from '@models/project.model';
import { ProjectDetailsService } from '@core/services/project/project-details/project-details.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

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
export class ProjectDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly projectDetailsService = inject(ProjectDetailsService);

  // Signals
  readonly workId = signal<string | null>(null);
  readonly projectLoading = signal(false);
  readonly commentsLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly newCommentContent = signal('');
  readonly replyingToCommentId = signal<string | null>(null);
  readonly replyContent = signal('');

  readonly project = toSignal(this.projectDetailsService.project$);
  readonly publication = toSignal(this.projectDetailsService.publication$);
  readonly patent = toSignal(this.projectDetailsService.patent$);
  readonly research = toSignal(this.projectDetailsService.research$);
  readonly comments = toSignal(this.projectDetailsService.comments$);
  readonly attachments = toSignal(this.projectDetailsService.attachments$);
  readonly tags = toSignal(this.projectDetailsService.tags$);

  readonly getStatusOnProgess = getStatusOnProgess;

  ngOnInit(): void {
    this.workId.set(this.route.snapshot.params['id']);

    if (this.workId()) {
      this.loadProject();
    }
  }

  private loadProject(): void {
    this.projectLoading.set(true);
    this.projectDetailsService.loadProjectDetails(this.workId()!);

    this.projectDetailsService.project$.pipe(takeUntilDestroyed()).subscribe({
      next: (project) => {
        this.projectLoading.set(false);

        this.updateHeader(project);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.projectLoading.set(false);
        this.errorMessage.set('Failed to load project details');
      },
    });
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

    this.projectDetailsService.deleteProject(this.workId()!).subscribe({
      next: () => this.router.navigate(['/projects/list']),
      error: (err) => {
        console.error('Error deleting project:', err);
        this.errorMessage.set('Failed to delete project');
      },
    });
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
    this.projectDetailsService
      .updateComment(commentId, newContent)
      .pipe(finalize(() => this.commentsLoading.set(false)))
      .subscribe({
        error: (err) => console.error('Error updating comment:', err),
      });
  }

  onCommentDelete(commentId: string): void {
    this.commentsLoading.set(true);
    this.projectDetailsService
      .deleteComment(commentId)
      .pipe(finalize(() => this.commentsLoading.set(false)))
      .subscribe({
        error: (err) => console.error('Error deleting comment:', err),
      });
  }

  startReply(commentId: string) {
    this.replyingToCommentId.set(commentId);
  }

  cancelReply() {
    this.replyingToCommentId.set(null);
    this.replyContent.set('');
  }
}
