import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ProjectCommentsComponent } from './project-comments.component';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
import { ProjectCommentService } from '@core/services/project/project-details/comments/project-comment.service';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { of, throwError } from 'rxjs';

describe('ProjectCommentsComponent', () => {
  let component: ProjectCommentsComponent;
  let fixture: ComponentFixture<ProjectCommentsComponent>;
  let mockCommentService: jasmine.SpyObj<ProjectCommentService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockCommentService = jasmine.createSpyObj('ProjectCommentService', [
      'setCurrentProjectId',
      'refreshComments',
      'postComment',
      'likeComment',
      'unlikeComment',
      'updateComment',
      'deleteComment',
      'comments$',
    ]);

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    mockCommentService.comments$ = of([]);

    await TestBed.configureTestingModule({
      imports: [
        MatProgressBarModule,
        FormsModule,
        MatButtonModule,
        CommentComponent,
        JsonPipe,
        ProjectCommentsComponent,
      ],
      providers: [
        { provide: ProjectCommentService, useValue: mockCommentService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty comments', () => {
    expect(component.comments()).toEqual([]);
  });

  it('should set project ID and refresh comments when projectId input changes', () => {
    const projectId = 'test-project';
    fixture.componentRef.setInput('projectId', projectId);
    fixture.detectChanges();

    expect(mockCommentService.setCurrentProjectId).toHaveBeenCalledWith(
      projectId
    );
    expect(mockCommentService.refreshComments).toHaveBeenCalledWith(projectId);
  });

  describe('postComment', () => {
    it('should not post comment if no projectId or empty content', async () => {
      fixture.componentRef.setInput('projectId', null);
      await component.postComment();
      expect(mockCommentService.postComment).not.toHaveBeenCalled();

      fixture.componentRef.setInput('projectId', 'test-project');
      component.newCommentContent.set('');
      await component.postComment();
      expect(mockCommentService.postComment).not.toHaveBeenCalled();
    });

    it('should post comment with valid data', fakeAsync(async () => {
      const projectId = 'test-project';
      const commentContent = 'Test comment';
      fixture.componentRef.setInput('projectId', projectId);
      component.newCommentContent.set(commentContent);

      mockCommentService.postComment.and.returnValue(of({}));

      await component.postComment();
      tick(500); // Account for minimum loading time

      expect(mockCommentService.postComment).toHaveBeenCalledWith({
        content: commentContent,
        projectId,
        parentCommentId: undefined,
      });
      expect(component.newCommentContent()).toBe('');
    }));

    it('should handle error when posting comment fails', fakeAsync(async () => {
      const projectId = 'test-project';
      fixture.componentRef.setInput('projectId', projectId);
      component.newCommentContent.set('Test comment');

      mockCommentService.postComment.and.returnValue(
        throwError(() => new Error('Failed'))
      );

      await component.postComment();
      tick(500);

      expect(component.commentsLoading()).toBeFalse();
    }));
  });

  describe('postReply', () => {
    it('should not post reply if no content or projectId', async () => {
      fixture.componentRef.setInput('projectId', null);
      await component.postReply('parent-id');
      expect(mockCommentService.postComment).not.toHaveBeenCalled();
      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Please enter reply content'
      );

      fixture.componentRef.setInput('projectId', 'test-project');
      component.replyContent.set('');
      await component.postReply('parent-id');
      expect(mockCommentService.postComment).not.toHaveBeenCalled();
    });

    it('should post reply with valid data', fakeAsync(async () => {
      const projectId = 'test-project';
      const replyContent = 'Test reply';
      const parentId = 'parent-id';
      fixture.componentRef.setInput('replyingToCommentId', parentId);
      component.replyContent.set(replyContent);

      mockCommentService.postComment.and.returnValue(of({}));

      await component.postReply(parentId);
      tick(500);

      expect(mockCommentService.postComment).toHaveBeenCalledWith({
        content: replyContent,
        projectId,
        parentCommentId: parentId,
      });
      expect(component.replyContent()).toBe('');
      expect(component.replyingToCommentId()).toBeNull();
    }));
  });

  describe('comment interactions', () => {
    it('should like comment', fakeAsync(async () => {
      const commentId = 'comment-id';
      mockCommentService.likeComment.and.returnValue(of({}));

      await component.onCommentLikeToggle(['like', commentId]);
      tick(500);

      expect(mockCommentService.likeComment).toHaveBeenCalledWith(commentId);
    }));

    it('should unlike comment', fakeAsync(async () => {
      const commentId = 'comment-id';
      mockCommentService.unlikeComment.and.returnValue(of({}));

      await component.onCommentLikeToggle(['unlike', commentId]);
      tick(500);

      expect(mockCommentService.unlikeComment).toHaveBeenCalledWith(commentId);
    }));

    it('should edit comment', fakeAsync(async () => {
      const commentId = 'comment-id';
      const newContent = 'Updated content';
      mockCommentService.updateComment.and.returnValue(of({}));

      await component.onCommentEdit(commentId, newContent);
      tick(500);

      expect(mockCommentService.updateComment).toHaveBeenCalledWith(
        commentId,
        newContent
      );
    }));

    it('should delete comment', fakeAsync(async () => {
      const commentId = 'comment-id';
      mockCommentService.deleteComment.and.returnValue(of({}));

      await component.onCommentDelete(commentId);
      tick(500);

      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(commentId);
    }));
  });

  it('should start and cancel reply', () => {
    const commentId = 'comment-id';
    component.startReply(commentId);
    expect(component.replyingToCommentId()).toBe(commentId);

    component.cancelReply();
    expect(component.replyingToCommentId()).toBeNull();
    expect(component.replyContent()).toBe('');
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    component.subscriptions.push(unsubscribeSpy);

    component.ngOnDestroy();

    expect(unsubscribeSpy.unsubscribe).toHaveBeenCalled();
  });
});
