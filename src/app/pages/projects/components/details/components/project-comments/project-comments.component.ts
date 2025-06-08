import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { ICreateComment } from '@models/comment.types';
import { lastValueFrom, Observable, Subscription } from 'rxjs';
import { ProjectCommentService } from '@core/services/project/project-details/comments/project-comment.service';
import { NotificationService } from '@core/services/notification.service';
import { JsonPipe } from '@angular/common';

// TODO (when it's over): pagination

@Component({
  selector: 'details-project-comments',
  imports: [
    CommentComponent,
    MatProgressBarModule,
    FormsModule,
    MatButtonModule,
    JsonPipe,
  ],
  templateUrl: './project-comments.component.html',
  styleUrl: './project-comments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCommentsComponent {
  private readonly projectCommentService = inject(ProjectCommentService);
  private readonly notificationService = inject(NotificationService);

  readonly commentsLoading = signal(false);
  readonly newCommentContent = signal('');
  readonly replyingToCommentId = signal<string | null>(null);
  readonly replyContent = signal('');

  readonly comments = toSignal(this.projectCommentService.comments$);

  projectId = input<string | null>();

  private subscriptions: Subscription[] = [];

  private projectIdChange = effect(() => {
    if (this.projectId()) {
      this.projectCommentService.setCurrentProjectId(this.projectId()!);
      this.projectCommentService.refreshComments(this.projectId()!);
    }
  });

  async postComment() {
    if (!this.projectId() || !this.newCommentContent().trim()) return;

    const comment: ICreateComment = {
      content: this.newCommentContent(),
      projectId: this.projectId()!,
      parentCommentId: this.replyingToCommentId()! || undefined,
    };

    try {
      await this.withMinimumLoading(
        this.projectCommentService.postComment(comment)
      );
      this.newCommentContent.set('');
      this.replyingToCommentId.set(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  }

  async postReply(parentCommentId: string) {
    if (!this.replyContent().trim() || !this.projectId()) {
      this.notificationService.showError('Please enter reply content');

      return;
    }

    const comment: ICreateComment = {
      content: this.replyContent(),
      projectId: this.projectId()!,
      parentCommentId,
    };

    console.log('Sending reply:', comment);

    try {
      await this.withMinimumLoading(
        this.projectCommentService.postComment(comment)
      );
      this.replyContent.set('');
      this.replyingToCommentId.set(null);
    } catch (error) {
      console.error('Error posting reply:', error);
      this.notificationService.showError('Failed to post reply');
    }
  }

  async onCommentLikeToggle([action, commentId]: ['like' | 'unlike', string]) {
    const serviceCall =
      action === 'like'
        ? this.projectCommentService.likeComment(commentId)
        : this.projectCommentService.unlikeComment(commentId);

    try {
      await this.withMinimumLoading(serviceCall);
    } catch (error) {
      console.error(`Error ${action} comment:`, error);
    }
  }

  async onCommentEdit(commentId: string, newContent: string) {
    try {
      await this.withMinimumLoading(
        this.projectCommentService.updateComment(commentId, newContent)
      );
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }

  async onCommentDelete(commentId: string) {
    try {
      await this.withMinimumLoading(
        this.projectCommentService.deleteComment(commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  startReply(commentId: string) {
    this.replyingToCommentId.set(commentId);
  }

  cancelReply() {
    this.replyingToCommentId.set(null);
    this.replyContent.set('');
  }

  private async withMinimumLoading<T>(
    operation: Observable<T>,
    minTime = 500
  ): Promise<T> {
    const startTime = Date.now();
    this.commentsLoading.set(true);

    try {
      const result = await lastValueFrom(operation);
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minTime - elapsed);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));
      return result;
    } catch (error) {
      throw error;
    } finally {
      this.commentsLoading.set(false);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
