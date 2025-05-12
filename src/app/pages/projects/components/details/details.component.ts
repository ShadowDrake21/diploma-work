import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationComponent } from './types/publication/publication.component';
import { ResearchProjectComponent } from './types/research-project/research-project.component';
import { PatentComponent } from './types/patent/patent.component';

import { HeaderService } from '@core/services/header.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { AsyncPipe, DatePipe, JsonPipe, TitleCasePipe } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import { getStatusOnProgess } from '@shared/utils/format.utils';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { MatButtonModule } from '@angular/material/button';
import { ICreateComment } from '@shared/types/comment.types';
import { FormsModule } from '@angular/forms';
import { ProjectDTO } from '@models/project.model';
import { ProjectDetailsService } from '@core/services/project-details/project-details.service';

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
    AsyncPipe,
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  projectDetailsService = inject(ProjectDetailsService);

  workId: string | null = null;
  work: ProjectDTO | undefined;
  errorMessage: string | null = null;
  newCommentContent = '';
  replyingToCommentId: string | null = null;
  replyContent = '';
  commentsLoading = false;
  private loadingTimeout: any;
  private subscriptions: Subscription[] = [];

  project$ = this.projectDetailsService.project$;
  publication$ = this.projectDetailsService.publication$;
  patent$ = this.projectDetailsService.patent$;
  research$ = this.projectDetailsService.research$;
  comments$ = this.projectDetailsService.comments$;
  commentsLoading$ = this.projectDetailsService.commentsLoading$;

  getStatusOnProgess = getStatusOnProgess;

  projectLoading = false;

  ngOnInit(): void {
    this.workId = this.route.snapshot.params['id'];

    if (this.workId) {
      this.loadProject();
    }
  }

  private loadProject(): void {
    this.projectLoading = true;
    this.projectDetailsService.loadProjectDetails(this.workId!);

    this.subscriptions.push(
      this.projectDetailsService.project$.subscribe({
        next: (project) => {
          this.projectLoading = false;
          this.work = project;
          this.updateHeader(project);
        },
        error: (err) => {
          this.projectLoading = false;
          console.error('Error loading project:', err);
          this.errorMessage = 'Failed to load project details';
        },
      })
    );
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

  private initializeComponents() {
    if (!this.workId) return;

    this.projectDetailsService.loadProjectDetails(this.workId);
    this.setupHeader();
    this.project$.subscribe((project) => {
      console.log('Project:', project);
    });
    this.subscriptions.push(
      this.project$.subscribe((project) => {
        this.work = project;
      })
    );
  }

  private setupHeader() {
    if (this.work) {
      const capitalizedType =
        this.work.type.charAt(0).toUpperCase() + this.work.type.slice(1);
      this.headerService.setTitle(`${capitalizedType}: ${this.work.title}`);
    } else {
      this.headerService.setTitle('Project Details');
    }
  }

  loadComments(): void {
    if (!this.workId) return;
    this.setLoadingState(true);
    this.projectDetailsService.loadComments(this.workId);
  }

  private setLoadingState(loading: boolean) {
    clearTimeout(this.loadingTimeout);

    if (loading) {
      this.commentsLoading = true;
    } else {
      this.loadingTimeout = setTimeout(() => {
        this.commentsLoading = false;
      }, 2000 + Math.random() * 1000);
    }
  }

  onEdit() {
    this.router.navigate(['../create'], {
      relativeTo: this.route,
      queryParams: { id: this.workId },
    });
  }

  onDelete() {
    if (!this.workId) return;

    this.projectDetailsService.deleteProject(this.workId).subscribe({
      next: () => this.router.navigate(['/projects/list']),
      error: (err) => {
        console.error('Error deleting project:', err);
        this.errorMessage = 'Failed to delete project';
      },
    });
  }

  postComment() {
    if (!this.workId || !this.newCommentContent.trim()) return;

    const comment: ICreateComment = {
      content: this.newCommentContent,
      projectId: this.workId,
      parentCommentId: this.replyingToCommentId || undefined,
    };

    this.projectDetailsService.postComment(comment, () => {
      this.newCommentContent = '';
      this.replyingToCommentId = null;
    });
  }

  postReply(parentCommentId: string) {
    if (!this.replyContent.trim()) return;

    const comment: ICreateComment = {
      content: this.replyContent,
      projectId: this.workId!,
      parentCommentId,
    };

    this.projectDetailsService.postComment(comment, () => {
      this.replyContent = '';
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
    this.setLoadingState(true);
    this.projectDetailsService
      .updateComment(commentId, newContent)
      .pipe(
        finalize(() => {
          this.setLoadingState(false);
        })
      )
      .subscribe({
        error: (err) => console.error('Error updating comment:', err),
      });
  }

  onCommentDelete(commentId: string): void {
    this.setLoadingState(true);
    this.projectDetailsService
      .deleteComment(commentId)
      .pipe(
        finalize(() => {
          this.setLoadingState(false);
        })
      )
      .subscribe({
        error: (err) => console.error('Error deleting comment:', err),
      });
  }

  startReply(commentId: string) {
    this.replyingToCommentId = commentId;
  }

  cancelReply() {
    this.replyingToCommentId = null;
    this.replyContent = '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    clearTimeout(this.loadingTimeout);
  }
}
