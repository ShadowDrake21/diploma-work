import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { recentProjectModalContent } from '@content/recentProjects.content';
import { DashboardRecentProjectItemModal } from '@shared/types/dashboard.types';
import { PublicationComponent } from './types/publication/publication.component';
import { ResearchProjectComponent } from './types/research-project/research-project.component';
import { PatentComponent } from './types/patent/patent.component';

import { HeaderService } from '@core/services/header.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { userComments } from '@content/userComments.content';
import { PublicationService } from '@core/services/publication.service';
import { PatentService } from '@core/services/patent.service';
import { ResearchService } from '@core/services/research.service';
import { ProjectService } from '@core/services/project.service';
import { Project } from '@shared/types/project.types';
import { catchError, forkJoin, Observable, of, Subscription, tap } from 'rxjs';
import { getStatusOnProgess } from '@shared/utils/format.utils';
import { TagService } from '@core/services/tag.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { MatButtonModule } from '@angular/material/button';
import { CommentService } from '@core/services/comment.service';
import {
  CommentInterface,
  CreateCommentInterface,
} from '@shared/types/comment.types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'project-details',
  imports: [
    PublicationComponent,
    ResearchProjectComponent,
    PatentComponent,
    MatButton,
    MatProgressBarModule,
    MatIcon,
    MatChipSet,
    MatChip,
    ProjectCardComponent,
    CommentComponent,
    TitleCasePipe,
    AsyncPipe,
    DatePipe,
    TruncateTextPipe,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private projectService = inject(ProjectService);
  private tagService = inject(TagService);
  private attachmentsService = inject(AttachmentsService);
  private commentService = inject(CommentService);

  workId: string | null = null;
  work: DashboardRecentProjectItemModal | undefined = undefined;
  comment = userComments[0];

  project$!: Observable<Project | undefined>;
  tags$!: Observable<any>;
  publication$!: Observable<any>;
  patent$!: Observable<any>;
  research$!: Observable<any>;

  attachments$!: Observable<any>;

  subscriptions: Subscription[] = [];

  errorMessage: string | null = null;

  getStatusOnProgess = getStatusOnProgess;

  comments$!: Observable<CommentInterface[]>;
  newCommentContent = '';
  replyingToCommentId: string | null = null;
  replyContent = '';

  ngOnInit(): void {
    const paramsSub = this.route.params.subscribe((params) => {
      this.workId = params['id'];
    });

    this.getWorkById();
    this.subscriptions.push(paramsSub);
  }

  getWorkById() {
    if (!this.workId) return;

    this.project$ = this.projectService.getProjectById(this.workId);

    const projectSub = this.project$.subscribe((project) => {
      console.log('project', project);
      this.tags$ = project?.tagIds
        ? forkJoin(
            project?.tagIds.map((tagId) => this.tagService.getTagById(tagId))
          )
        : new Observable();

      if (project?.type) {
        this.attachments$ = this.attachmentsService
          .getFilesByEntity(project?.type, this.workId!)
          .pipe(
            tap((attachments) => {
              console.log('attachments', attachments);
            }),
            catchError((error) => {
              console.error('Error fetching attachments:', error);
              this.errorMessage =
                'Failed to load attachments. Please try again later.';
              return of([]); // Return an empty array to prevent the template from breaking
            })
          );
      }

      if (project?.type === 'PUBLICATION') {
        console.log('publication');
      } else if (project?.type === 'PATENT') {
        console.log('patent');
      } else {
        console.log('research');
        this.research$ = this.projectService
          .getResearchByProjectId(this.workId!)
          .pipe(
            tap((research) => {
              console.log('research', research);
            })
          );
      }
    });

    if (this.work) {
      const capitalizedType =
        this.work.type.charAt(0).toUpperCase() + this.work.type.slice(1);
      this.headerService.setTitle(
        `${capitalizedType}: ${this.work.projectTitle}`
      );
    } else {
      this.headerService.setTitle('Project Details');
    }

    this.subscriptions.push(projectSub);
  }

  onEdit() {
    this.router.navigate(['../create'], {
      relativeTo: this.route,
      queryParams: { id: this.workId },
    });
  }

  onDelete() {
    const deleteSub = this.projectService
      .deleteProject(this.workId!)
      .subscribe(() => {
        this.router.navigate(['/projects/list']);
      });

    this.subscriptions.push(deleteSub);
  }

  openPdfInNewTab(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  loadComments() {
    if (!this.workId) return;
    this.comments$ = this.commentService.getCommentsByProjectId(this.workId);
  }

  postComment() {
    if (!this.workId || !this.newCommentContent.trim()) return;

    const comment: CreateCommentInterface = {
      content: this.newCommentContent,
      projectId: this.workId,
      parentCommentId: this.replyingToCommentId || undefined,
    };

    this.commentService.createComment(comment).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.replyingToCommentId = null;
        this.loadComments();
      },
      error: (error) => {
        console.error('Error posting comment:', error);
      },
    });
  }

  postReply(parentCommentId: string) {
    if (!this.replyContent.trim()) return;

    const comment: CreateCommentInterface = {
      content: this.replyContent,
      projectId: this.workId!,
      parentCommentId,
    };

    this.commentService.createComment(comment).subscribe({
      next: () => {
        this.replyContent = '';
        this.loadComments();
      },
      error: (err) => console.error('Error posting reply:', err),
    });
  }

  onCommentLike(commentId: string) {
    this.commentService.likeComment(commentId).subscribe({
      next: () => {
        this.loadComments();
      },
      error: (err) => console.error('Error liking comment:', err),
    });
  }

  onCommentEdit(commentId: string, newContent: string) {
    this.commentService.updateComment(commentId, newContent).subscribe({
      next: () => this.loadComments(),
      error: (err) => console.error('Error updating comment:', err),
    });
  }

  onCommentDelete(commentId: string) {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => this.loadComments(),
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
  }
}
