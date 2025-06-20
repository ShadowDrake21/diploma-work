import { TestBed } from '@angular/core/testing';

import { ProjectCommentService } from './project-comment.service';
import { CommentService } from '@core/services/comment.service';
import { NotificationService } from '@core/services/notification.service';
import { IComment, ICreateComment } from '@models/comment.types';
import { currentUserSig } from '@core/shared/shared-signals';
import { UserRole } from '@shared/enums/user.enum';
import { of, throwError } from 'rxjs';

describe('ProjectCommentService', () => {
  let service: ProjectCommentService;
  let commentServiceMock: jasmine.SpyObj<CommentService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockComment: IComment = {
    id: '1',
    content: 'Test comment',
    projectId: 'project123',
    projectTitle: 'Test Project',
    userId: 1,
    userName: 'Test User',
    userAvatarUrl: 'https://example.com/avatar.jpg',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    likes: 0,
    likedByCurrentUser: false,
  };

  beforeEach(() => {
    commentServiceMock = jasmine.createSpyObj('CommentService', [
      'getCommentsByProjectId',
      'createComment',
      'likeComment',
      'unlikeComment',
      'updateComment',
      'deleteComment',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectCommentService,
        { provide: CommentService, useValue: commentServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    service = TestBed.inject(ProjectCommentService);
    currentUserSig.set({
      id: 1,
      username: 'Test User',
      email: 'test@example.com',
      role: UserRole.USER,
      affiliation: 'MIT',
      publicationCount: 1,
      patentCount: 1,
      researchCount: 1,
      tags: ['1'],
      active: true,
    });
  });

  afterEach(() => {
    currentUserSig.set(null);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setCurrentProjectId', () => {
    it('should set current project ID', () => {
      service.setCurrentProjectId('project123');
      expect(service['currentProjectId']).toBe('project123');
    });
  });

  describe('refreshComments', () => {
    it('should load comments and update state', () => {
      const mockComments = [mockComment];
      commentServiceMock.getCommentsByProjectId.and.returnValue(
        of(mockComments)
      );

      service.refreshComments('project123');

      expect(commentServiceMock.getCommentsByProjectId).toHaveBeenCalledWith(
        'project123'
      );
      service.comments$.subscribe((comments) => {
        expect(comments).toEqual(mockComments);
      });
    });

    it('should handle error and show notification', () => {
      const error = new Error('Failed to load');
      commentServiceMock.getCommentsByProjectId.and.returnValue(
        throwError(() => error)
      );

      service.refreshComments('project123');

      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Не вдалося завантажити коментарі'
      );
    });
  });

  describe('postComment', () => {
    it('should post comment and refresh', () => {
      const newComment: ICreateComment = {
        content: 'New comment',
        projectId: 'project123',
      };
      commentServiceMock.createComment.and.returnValue(of(mockComment));
      const refreshSpy = spyOn(service, 'refreshComments');

      service.postComment(newComment).subscribe();

      expect(commentServiceMock.createComment).toHaveBeenCalledWith(newComment);
      expect(refreshSpy).toHaveBeenCalledWith('project123');
      expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
        'Коментар успішно опубліковано'
      );
    });

    it('should handle error when posting comment', () => {
      const newComment: ICreateComment = {
        content: 'New comment',
        projectId: 'project123',
      };
      const error = new Error('Failed to post');
      commentServiceMock.createComment.and.returnValue(throwError(() => error));

      service.postComment(newComment).subscribe({
        error: (err) => expect(err).toEqual(error),
      });

      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Не вдалося опублікувати коментар'
      );
    });

    it('should show error when user is not authenticated', () => {
      currentUserSig.set(null);
      const newComment: ICreateComment = {
        content: 'New comment',
        projectId: 'project123',
      };

      service.postComment(newComment).subscribe({
        error: (err) =>
          expect(err.message).toEqual('Користувач не автентифіковано'),
      });

      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Будь ласка, увійдіть, щоб залишити коментар'
      );
    });
  });

  describe('like/unlikeComment', () => {
    it('should like comment and update state', () => {
      commentServiceMock.likeComment.and.returnValue(
        of({ ...mockComment, likes: 1, likedByCurrentUser: true })
      );
      service['_comments'].next([mockComment]);

      service.likeComment('1').subscribe();

      expect(commentServiceMock.likeComment).toHaveBeenCalledWith('1');
      service.comments$.subscribe((comments) => {
        expect(comments[0].likes).toBe(1);
        expect(comments[0].likedByCurrentUser).toBeTrue();
      });
    });

    it('should unlike comment and update state', () => {
      const likedComment = {
        ...mockComment,
        likes: 1,
        likedByCurrentUser: true,
      };
      commentServiceMock.unlikeComment.and.returnValue(
        of({ ...mockComment, likes: 0, likedByCurrentUser: false })
      );
      service['_comments'].next([likedComment]);

      service.unlikeComment('1').subscribe();

      expect(commentServiceMock.unlikeComment).toHaveBeenCalledWith('1');
      service.comments$.subscribe((comments) => {
        expect(comments[0].likes).toBe(0);
        expect(comments[0].likedByCurrentUser).toBeFalse();
      });
    });
  });

  describe('updateComment', () => {
    it('should update comment and refresh', () => {
      commentServiceMock.updateComment.and.returnValue(of(mockComment));
      service.setCurrentProjectId('project123');
      const refreshSpy = spyOn(service, 'refreshComments');

      service.updateComment('1', 'Updated content').subscribe();

      expect(commentServiceMock.updateComment).toHaveBeenCalledWith(
        '1',
        'Updated content'
      );
      expect(refreshSpy).toHaveBeenCalledWith('project123');
      expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
        'Коментар успішно оновлено'
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete comment and refresh', () => {
      commentServiceMock.deleteComment.and.returnValue(of(void 0));
      service.setCurrentProjectId('project123');
      const refreshSpy = spyOn(service, 'refreshComments');

      service.deleteComment('1').subscribe();

      expect(commentServiceMock.deleteComment).toHaveBeenCalledWith('1');
      expect(refreshSpy).toHaveBeenCalledWith('project123');
      expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
        'Коментар успішно видалено'
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroyed$ subject', () => {
      const nextSpy = spyOn(service['destroyed$'], 'next');
      const completeSpy = spyOn(service['destroyed$'], 'complete');

      service.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
