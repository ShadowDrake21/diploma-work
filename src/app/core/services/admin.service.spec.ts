import { TestBed } from '@angular/core/testing';

import { AdminService } from './admin.service';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { BASE_URL } from '@core/constants/default-variables';
import { PaginatedResponse } from '@models/api-response.model';
import { IComment } from '@models/comment.types';
import { ProjectResponse, ProjectWithDetails } from '@models/project.model';
import { UserLogin } from '@models/user-login.model';
import { IUser } from '@models/user.model';
import { SortingDirection } from '@shared/enums/sorting.enum';
import { NotificationService } from './notification.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { UserRole } from '@shared/enums/user.enum';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  let notificationService: jest.Mocked<NotificationService>;

  const mockUsers: IUser[] = [
    {
      id: 1,
      email: 'user1@test.com',
      role: UserRole.USER,
      active: true,
      username: '',
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
    },
    {
      id: 2,
      email: 'user2@test.com',
      role: UserRole.ADMIN,
      active: true,
      username: '',
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
    },
  ];

  const mockProjects: ProjectResponse[] = [
    {
      id: '1',
      title: 'Project 1',
      description: 'Description 1',
      tag: [],
      creator: {
        id: '',
        name: '',
        email: '',
      },
      type: ProjectType.PUBLICATION,
      progress: 0,
      createdAt: '',
      updatedAt: '',
      createdBy: 0,
    },
    {
      id: '2',
      title: 'Project 2',
      description: 'Description 2',
      tag: [],
      creator: {
        id: '',
        name: '',
        email: '',
      },
      type: ProjectType.PUBLICATION,
      progress: 0,
      createdAt: '',
      updatedAt: '',
      createdBy: 0,
    },
  ];

  const mockComments: IComment[] = [
    {
      id: '1',
      content: 'Comment 1',
      createdAt: '',
      updatedAt: '',
      likes: 0,
      projectId: '',
      projectTitle: '',
      likedByCurrentUser: false,
      userId: 0,
      userName: '',
      userAvatarUrl: null,
    },
    {
      id: '2',
      content: 'Comment 2',
      createdAt: '',
      updatedAt: '',
      likes: 0,
      projectId: '',
      projectTitle: '',
      likedByCurrentUser: false,
      userId: 0,
      userName: '',
      userAvatarUrl: null,
    },
  ];

  const mockLogins: UserLogin[] = [
    {
      id: 1,
      userId: 1,
      loginTime: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      username: '',
      email: '',
      userAgent: '',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AdminService,
        {
          provide: NotificationService,
          useValue: {
            showSuccess: jest.fn(),
            showError: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(
      NotificationService
    ) as jest.Mocked<NotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User Management', () => {
    it('should get all users with pagination', () => {
      const mockResponse: PaginatedResponse<IUser> = {
        data: mockUsers,
        totalItems: 2,
        page: 1,
        success: true,
        hasNext: false,
        timestamp: new Date().toISOString(),
        totalPages: 1,
      };

      service
        .getAllUsers(0, 10, 'id', SortingDirection.ASC)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(service.loading()).toBeFalse();
        });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users?page=0&size=10&sortBy=id&direction=ASC`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should promote user to admin', () => {
      const userId = 1;
      const mockUser: IUser = { ...mockUsers[0], role: UserRole.ADMIN };

      service.promoteToAdmin(userId).subscribe((user) => {
        expect(user).toEqual(mockUser);
        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'Користувача підвищено до адміністратора'
        );
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users/${userId}/promote`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockUser);
    });

    it('should handle error when promoting user', () => {
      const userId = 1;

      service.promoteToAdmin(userId).subscribe({
        error: () => {
          expect(notificationService.showError).toHaveBeenCalled();
          expect(service.loading()).toBeFalse();
        },
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users/${userId}/promote`
      );
      req.error(new ProgressEvent('error'), { status: 403 });
    });

    it('should deactivate user', () => {
      const userId = 1;

      service.deactivateUser(userId).subscribe(() => {
        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'Користувач деактивовано'
        );
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users/${userId}/deactivate`
      );
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should reactivate user', () => {
      const userId = 1;

      service.reactivateUser(userId).subscribe(() => {
        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'Користувача реактивовано'
        );
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users/${userId}/reactivate`
      );
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should delete user', () => {
      const userId = 1;

      service.deleteUser(userId).subscribe(() => {
        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'Користувача видалено'
        );
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(`${BASE_URL}admin/users/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('Project Management', () => {
    it('should load all projects with pagination', () => {
      const mockResponse: PaginatedResponse<ProjectResponse> = {
        data: mockProjects,
        totalItems: 2,
        page: 1,
        success: true,
        hasNext: false,
        timestamp: new Date().toISOString(),
        totalPages: 1,
      };

      service.loadAllProjects(0, 10).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(service.projects()).toEqual(mockProjects);
        expect(service.projectsPagination()).toEqual({
          page: 0,
          size: 10,
          total: 2,
        });
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/projects?page=0&size=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get projects with details', () => {
      const mockProjectsWithDetails: ProjectWithDetails[] = mockProjects.map(
        (p) => ({
          project: { ...p, tagIds: [] },
          details: null,
          publications: [],
          patents: [],
          researches: [],
          comments: [],
          tagIds: [],
        })
      );

      const mockResponse: PaginatedResponse<ProjectWithDetails> = {
        data: mockProjectsWithDetails,
        totalItems: 2,
        page: 1,
        success: true,
        hasNext: false,
        timestamp: new Date().toISOString(),
        totalPages: 1,
      };

      service.getProjectsWithDetails(0, 10).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/with-details?page=0&pageSize=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('Comment Management', () => {
    it('should load all comments with pagination', () => {
      const mockResponse: PaginatedResponse<IComment> = {
        data: mockComments,
        totalItems: 2,
        page: 1,
        success: true,
        hasNext: false,
        timestamp: new Date().toISOString(),
        totalPages: 1,
      };

      service.loadAllComments(0, 10).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(service.comments()).toEqual(mockComments);
        expect(service.commentsPagination()).toEqual({
          page: 0,
          size: 10,
          total: 2,
        });
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/comments?page=0&size=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should delete comment', () => {
      const commentId = '1';

      service.deleteComment(commentId).subscribe(() => {
        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'Коментар видалено'
        );
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(`${BASE_URL}admin/comments/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('Login Statistics', () => {
    it('should get recent logins', () => {
      service.getRecentLogins(5).subscribe((response) => {
        expect(response).toEqual(mockLogins);
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(`${BASE_URL}admin/recent-logins?count=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLogins);
    });

    it('should get login stats', () => {
      const mockStats = 42;

      service.getLoginStats(24).subscribe((response) => {
        expect(response).toEqual(mockStats);
        expect(service.loading()).toBeFalse();
      });

      const req = httpMock.expectOne(`${BASE_URL}admin/login-stats?hours=24`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });

  describe('Error Handling', () => {
    it('should handle 403 error', () => {
      service.getAllUsers().subscribe({
        error: () => {
          expect(service.error()).toBe(
            'У вас немає дозволу на виконання цієї дії'
          );
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users?page=0&size=10&sortBy=id&direction=ASC`
      );
      req.error(new ProgressEvent('error'), { status: 403 });
    });

    it('should handle 404 error', () => {
      service.getAllUsers().subscribe({
        error: () => {
          expect(service.error()).toBe('Запитаний ресурс не знайдено');
        },
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users?page=0&size=10&sortBy=id&direction=ASC`
      );
      req.error(new ProgressEvent('error'), { status: 404 });
    });

    it('should handle generic error', () => {
      service.getAllUsers().subscribe({
        error: () => {
          expect(service.error()).toContain('Не вдалося: load users');
        },
      });

      const req = httpMock.expectOne(
        `${BASE_URL}admin/users?page=0&size=10&sortBy=id&direction=ASC`
      );
      req.error(new ProgressEvent('error'), { status: 500 });
    });
  });

  describe('State Management', () => {
    it('should reset state', () => {
      service.projects.set(mockProjects);
      service.publications.set([]);
      service.patents.set([]);
      service.researches.set([]);
      service.comments.set(mockComments);
      service.error.set('Some error');

      service.resetState();

      expect(service.projects()).toEqual([]);
      expect(service.publications()).toEqual([]);
      expect(service.patents()).toEqual([]);
      expect(service.researches()).toEqual([]);
      expect(service.comments()).toEqual([]);
      expect(service.error()).toBeNull();
    });
  });
});
