import { TestBed } from '@angular/core/testing';

import { CommentService } from './comment.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { PaginatedResponse } from '@models/api-response.model';
import { IComment, ICreateComment } from '@models/comment.types';
import { NotificationService } from './notification.service';
import { BASE_URL } from '@core/constants/default-variables';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const baseUrl = `${BASE_URL}comments`;
  const mockComment: IComment = {
    id: '1',
    content: 'Test comment',
    userId: 1,
    projectId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    projectTitle: 'title',
    likedByCurrentUser: false,
    userName: 'user',
    userAvatarUrl: 'http://example.com/avatar.jpg',
  };

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CommentService,
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });

    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCommentsByProjectId', () => {
    it('should fetch comments for a project', () => {
      const projectId = '1';
      const mockComments: IComment[] = [mockComment];

      service.getCommentsByProjectId(projectId).subscribe((comments) => {
        expect(comments).toEqual(mockComments);
      });

      const req = httpMock.expectOne(`${baseUrl}/project/${projectId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });

    it('should handle error when fetching comments fails', () => {
      const projectId = '1';

      service.getCommentsByProjectId(projectId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Не вдалося завантажити коментарі');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/project/${projectId}`);
      req.error(new ProgressEvent('error'));
      expect(notificationService.showError).toHaveBeenCalled();
    });
  });

  describe('createComment', () => {
    it('should create a new comment', () => {
      const newComment: ICreateComment = {
        content: 'New comment',
        projectId: '1',
      };

      service.createComment(newComment).subscribe((comment) => {
        expect(comment).toEqual(mockComment);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newComment);
      req.flush(mockComment);
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Коментар успішно створено'
      );
    });

    it('should handle error when comment creation fails', () => {
      const newComment: ICreateComment = {
        content: 'New comment',
        projectId: '1',
      };

      service.createComment(newComment).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Не вдалося створити коментар');
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));
      expect(notificationService.showError).toHaveBeenCalled();
    });
  });

  describe('updateComment', () => {
    it('should update a comment', () => {
      const commentId = '1';
      const updatedContent = 'Updated content';

      service.updateComment(commentId, updatedContent).subscribe((comment) => {
        expect(comment).toEqual(mockComment);
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedContent);
      req.flush(mockComment);
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Коментар успішно оновлено'
      );
    });

    it('should handle error when comment update fails', () => {
      const commentId = '1';
      const updatedContent = 'Updated content';

      service.updateComment(commentId, updatedContent).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Не вдалося оновити коментар');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}`);
      req.error(new ProgressEvent('error'));
      expect(notificationService.showError).toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', () => {
      const commentId = '1';

      service.deleteComment(commentId).subscribe(() => {
        expect().nothing();
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Коментар успішно видалено'
      );
    });

    it('should handle error when comment deletion fails', () => {
      const commentId = '1';

      service.deleteComment(commentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Не вдалося видалити коментар');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}`);
      req.error(new ProgressEvent('error'));
      expect(notificationService.showError).toHaveBeenCalled();
    });
  });

  describe('likeComment', () => {
    it('should like a comment', () => {
      const commentId = '1';

      service.likeComment(commentId).subscribe((comment) => {
        expect(comment).toEqual(mockComment);
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}/like`);
      expect(req.request.method).toBe('POST');
      req.flush(mockComment);
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Коментар лайкнутий'
      );
    });

    it('should handle error when liking fails', () => {
      const commentId = '1';

      service.likeComment(commentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Не вдалося лайкнути коментар');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}/like`);
      req.error(new ProgressEvent('error'));
      expect(notificationService.showError).toHaveBeenCalled();
    });
  });

  describe('unlikeComment', () => {
    it('should unlike a comment', () => {
      const commentId = '1';

      service.unlikeComment(commentId).subscribe((comment) => {
        expect(comment).toEqual(mockComment);
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}/like`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockComment);
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Знято лайк з коментаря'
      );
    });

    it('should handle error when unliking fails', () => {
      const commentId = '1';

      service.unlikeComment(commentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Не вдалося зняти лайк з коментаря');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${commentId}/like`);
      req.error(new ProgressEvent('error'));
      expect(notificationService.showError).toHaveBeenCalled();
    });
  });

  describe('getCommentsByUserId', () => {
    it('should fetch paginated comments for a user', () => {
      const userId = 1;
      const page = 1;
      const size = 10;
      const mockResponse: PaginatedResponse<IComment> = {
        data: [mockComment],
        totalItems: 1,
        totalPages: 1,
        page,
        hasNext: true,
        success: false,
        timestamp: new Date().toISOString(),
      };

      service.getCommentsByUserId(userId, page, size).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/user/${userId}?page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching user comments fails', () => {
      const userId = 1;

      service.getCommentsByUserId(userId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain(
            'Не вдалося завантажити коментарі користувача'
          );
        },
      });

      const req = httpMock.expectOne(
        `${baseUrl}/user/${userId}?page=0&size=10`
      );
      req.error(new ProgressEvent('error'));
      expect(notificationService.showError).toHaveBeenCalled();
    });
  });

  describe('handleError', () => {
    it('should handle 401 error', () => {
      const errorResponse = { status: 401 };
      spyOn(notificationService, 'showError');

      service['handleError'](errorResponse, 'Default error').subscribe({
        error: (error) => {
          expect(error.message).toBe(
            'Будь ласка, увійдіть, щоб виконати цю дію'
          );
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Будь ласка, увійдіть, щоб виконати цю дію'
          );
        },
      });
    });

    it('should handle 403 error', () => {
      const errorResponse = { status: 403 };
      spyOn(notificationService, 'showError');

      service['handleError'](errorResponse, 'Default error').subscribe({
        error: (error) => {
          expect(error.message).toBe('Ви не маєте дозволу на цю дію');
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Ви не маєте дозволу на цю дію'
          );
        },
      });
    });

    it('should use error message from server if available', () => {
      const errorResponse = { error: { message: 'Custom error message' } };
      spyOn(notificationService, 'showError');

      service['handleError'](errorResponse, 'Default error').subscribe({
        error: (error) => {
          expect(error.message).toBe('Custom error message');
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Custom error message'
          );
        },
      });
    });
  });
});
