import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificationService } from '../notification.service';
import { ProjectService } from '../project/models/project.service';
import {
  IAuthorizedUser,
  ICreateUser,
  IUpdateUserProfile,
  IUser,
  ParticipantDTO,
} from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';
import { BASE_URL } from '@core/constants/default-variables';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { PageResponse } from '@shared/types/generics.types';
import { of, throwError } from 'rxjs';
import { PaginatedResponse } from '@models/api-response.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let projectService: jasmine.SpyObj<ProjectService>;

  const mockUser: IUser = {
    id: 1,
    username: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    affiliation: 'University of Testing',
    publicationCount: 0,
    patentCount: 0,
    researchCount: 0,
    tags: [],
    active: true,
  };

  const baseUrl = `${BASE_URL}/users`;

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess',
    ]);
    const projectSpy = jasmine.createSpyObj('ProjectService', [
      'getPublicationByProjectId',
      'getPatentByProjectId',
      'getResearchByProjectId',
    ]);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: NotificationService, useValue: notificationSpy },
        { provide: ProjectService, useValue: projectSpy },
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    projectService = TestBed.inject(
      ProjectService
    ) as jasmine.SpyObj<ProjectService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPaginatedUsers', () => {
    it('should return paginated users', () => {
      const mockResponse: PageResponse<IUser> = {
        data: [mockUser],
        page: 0,

        totalItems: 1,
        totalPages: 1,
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
        hasNext: false,
      };

      service.getPaginatedUsers().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}?page=0&size=10&sort=createdAt,desc`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error', () => {
      service.getPaginatedUsers().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(
        `${baseUrl}?page=0&size=10&sort=createdAt,desc`
      );
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      service.getCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should show specific error message on failure', () => {
      service.getCurrentUser().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Не вдалося завантажити ваш профіль користувача'
          );
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/me`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', () => {
      const updateData: IUpdateUserProfile = { phoneNumber: '+3909900222' };

      service.updateUserProfile(updateData).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/me/profile`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockUser);
    });

    it('should show specific error message on failure', () => {
      const updateData: IUpdateUserProfile = { phoneNumber: '+3909900222' };

      service.updateUserProfile(updateData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Не вдалося оновити ваш профіль'
          );
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/me/profile`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateUserAvatar', () => {
    it('should update user avatar', () => {
      const file = new File([''], 'avatar.jpg');

      service.updateUserAvatar(file).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/me/avatar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(mockUser);
    });

    it('should show file size error', () => {
      const file = new File([''], 'avatar.jpg');

      service.updateUserAvatar(file).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Розмір файлу занадто великий'
          );
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/me/avatar`);
      req.flush('Error', { status: 413, statusText: 'File Too Large' });
    });

    it('should show file type error', () => {
      const file = new File([''], 'avatar.unsupported');

      service.updateUserAvatar(file).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Непідтримуваний тип файлу'
          );
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/me/avatar`);
      req.flush('Error', { status: 415, statusText: 'Unsupported Media Type' });
    });
  });

  describe('getProjectsWithDetails', () => {
    const mockProjects: ProjectDTO[] = [
      {
        id: '1',
        type: ProjectType.PUBLICATION,
        title: 'Publication',
        description: 'Publication description',
        progress: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tagIds: [],
        createdBy: 1,
      },
      {
        id: '2',
        type: ProjectType.PATENT,
        title: 'Patent',
        description: 'Patent description',
        progress: 99,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tagIds: [],
        createdBy: 1,
      },
      {
        id: '3',
        type: ProjectType.RESEARCH,
        title: 'Research',
        description: 'Research description',
        progress: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tagIds: [],
        createdBy: 1,
      },
    ];

    it('should return projects with details', () => {
      projectService.getPublicationByProjectId.and.returnValue(
        of({ id: 1, publicationData: 'data' })
      );
      projectService.getPatentByProjectId.and.returnValue(
        of({ id: 2, patentData: 'data' })
      );
      projectService.getResearchByProjectId.and.returnValue(
        of({ id: 3, researchData: 'data' })
      );

      service.getProjectsWithDetails(1).subscribe((projects) => {
        expect(projects.length).toBe(3);
        expect(projects[0].publication).toBeDefined();
        expect(projects[1].patent).toBeDefined();
        expect(projects[2].research).toBeDefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1/projects`);
      req.flush(mockProjects);
    });

    it('should handle project service errors', () => {
      projectService.getPublicationByProjectId.and.returnValue(
        throwError(() => new Error('Error'))
      );
      projectService.getPatentByProjectId.and.returnValue(
        throwError(() => new Error('Error'))
      );
      projectService.getResearchByProjectId.and.returnValue(
        throwError(() => new Error('Error'))
      );

      service.getProjectsWithDetails(1).subscribe((projects) => {
        expect(projects.length).toBe(3);
        expect(projects[0].publication).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1/projects`);
      req.flush(mockProjects);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', () => {
      service.deleteUser(1).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should show permission error', () => {
      service.deleteUser(1).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'У вас немає дозволу видаляти користувачів'
          );
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush('Error', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', () => {
      const mockUsers: IUser[] = [mockUser, { ...mockUser, id: 2 }];

      service.getAllUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle error', () => {
      service.getAllUsers().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      req.flush('Error', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const newUser: ICreateUser = {
        email: 'new@example.com',
        password: 'password',
        role: UserRole.USER,
      };

      service.createUser(newUser).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(mockUser);
    });

    it('should handle creation error', () => {
      const newUser: ICreateUser = {
        email: 'new@example.com',
        password: 'password',
        role: UserRole.USER,
      };

      service.createUser(newUser).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', () => {
      const participantDTO: ParticipantDTO = {
        id: 1,
        username: 'Test User',

        avatarUrl: 'avatar.jpg',
      };

      service.getUserById(1).subscribe((user) => {
        expect(user).toEqual(participantDTO);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(participantDTO);
    });

    it('should handle not found error', () => {
      service.getUserById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getFullUserById', () => {
    it('should return full user details by id', () => {
      service.getFullUserById(1).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/info`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle permission error', () => {
      service.getFullUserById(1).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'У вас немає дозволу на доступ до цього ресурсу'
          );
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1/info`);
      req.flush('Error', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', () => {
      const authorizedUser: IAuthorizedUser = {
        ...mockUser,
        email: 'test@example.com',
        id: 1,
        role: UserRole.USER,
      };

      service.getUserByEmail('test@example.com').subscribe((user) => {
        expect(user).toEqual(authorizedUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/email/test@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(authorizedUser);
    });

    it('should handle invalid email error', () => {
      service.getUserByEmail('invalid@example.com').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/email/invalid@example.com`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getUsersByRole', () => {
    it('should return users by role', () => {
      const authorizedUsers: IAuthorizedUser[] = [
        { ...mockUser, role: UserRole.ADMIN },
        { ...mockUser, id: 2, role: UserRole.ADMIN },
      ];

      service.getUsersByRole('ADMIN').subscribe((users) => {
        expect(users).toEqual(authorizedUsers);
      });

      const req = httpMock.expectOne(`${baseUrl}/role/ADMIN`);
      expect(req.request.method).toBe('GET');
      req.flush(authorizedUsers);
    });

    it('should handle empty role error', () => {
      service.getUsersByRole('').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/role/`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('userExistsByEmail', () => {
    it('should return true if user exists', () => {
      service.userExistsByEmail('test@example.com').subscribe((exists) => {
        expect(exists).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/exists/test@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false if user does not exist', () => {
      service
        .userExistsByEmail('nonexistent@example.com')
        .subscribe((exists) => {
          expect(exists).toBeFalse();
        });

      const req = httpMock.expectOne(
        `${baseUrl}/exists/nonexistent@example.com`
      );
      req.flush(false);
    });

    it('should handle error', () => {
      service.userExistsByEmail('invalid@example.com').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(notificationService.showError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/exists/invalid@example.com`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getUserProjects', () => {
    it('should return user projects', () => {
      const mockProjects: ProjectDTO[] = [
        {
          id: '1',
          type: ProjectType.PUBLICATION,
          title: 'Test Project',
          createdBy: 1,
          description: '',
          progress: 0,
          createdAt: '',
          updatedAt: '',
          tagIds: [],
        },
      ];

      service.getUserProjects(1).subscribe((projects) => {
        expect(projects).toEqual(mockProjects);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/projects`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProjects);
    });

    it('should return empty array if no projects', () => {
      service.getUserProjects(1).subscribe((projects) => {
        expect(projects).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/projects`);
      req.flush([]);
    });
  });

  describe('searchUsers', () => {
    it('should search users with query', () => {
      const mockResponse: PageResponse<IUser> = {
        data: [mockUser],
        page: 0,
        totalItems: 1,
        totalPages: 1,
        success: false,
        message: '',
        timestamp: '',
        hasNext: false,
      };

      service.searchUsers('test').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search?query=test&page=0&size=10&sort=createdAt,desc`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty query', () => {
      const mockResponse: PageResponse<IUser> = {
        data: [],
        page: 0,
        totalItems: 0,
        totalPages: 0,
        success: false,
        message: '',
        timestamp: '',
        hasNext: false,
      };

      service.searchUsers('').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search?query=&page=0&size=10&sort=createdAt,desc`
      );
      req.flush(mockResponse);
    });
  });

  describe('getRecentlyActiveUsers', () => {
    it('should return recently active users', () => {
      const activeUsers: IUser[] = [mockUser, { ...mockUser, id: 2 }];

      service.getRecentlyActiveUsers().subscribe((users) => {
        expect(users).toEqual(activeUsers);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/recent-active-users?minutes=50&count=7`
      );
      expect(req.request.method).toBe('GET');
      req.flush(activeUsers);
    });

    it('should use custom parameters', () => {
      service.getRecentlyActiveUsers(30, 5).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/recent-active-users?minutes=30&count=5`
      );
      req.flush([]);
    });
  });

  describe('getUserCollaborators', () => {
    it('should return user collaborators', () => {
      const mockResponse: PaginatedResponse<IUser> = {
        data: [mockUser],
        page: 1,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        success: true,
        timestamp: new Date().toISOString(),
      };

      service.getUserCollaborators(1).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/1/collaborators?page=0&size=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use custom pagination', () => {
      service.getUserCollaborators(1, 2, 5).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/1/collaborators?page=2&size=5`
      );
      req.flush({ data: [], page: 2, totalItems: 0, totalPages: 0 });
    });
  });
});
