import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RecentUsersService } from './recent-users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/authentication/auth.service';
import { IUser } from '@models/user.model';
import { of, throwError } from 'rxjs';
import { NotificationService } from '../notification.service';
import { UserService } from './user.service';
import { UserRole } from '@shared/enums/user.enum';

describe('RecentUsersService', () => {
  let service: RecentUsersService;
  let userService: jasmine.SpyObj<UserService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockUsers: IUser[] = [
    {
      id: 1,
      username: 'User 1',
      email: 'user1@test.com',
      role: UserRole.USER,
      affiliation: 'University A',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
    {
      id: 2,
      username: 'User 2',
      email: 'user2@test.com',
      role: UserRole.USER,
      affiliation: 'University A',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
  ];

  beforeEach(() => {
    const userSpy = jasmine.createSpyObj('UserService', [
      'getRecentlyActiveUsers',
    ]);
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: of(null),
    });

    TestBed.configureTestingModule({
      providers: [
        RecentUsersService,
        { provide: UserService, useValue: userSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    });
    service = TestBed.inject(RecentUsersService);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    authService = TestBed.inject(AuthService) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null activeUsers', () => {
    expect(service.activeUsers()).toBeNull();
  });

  describe('with authenticated user', () => {
    beforeEach(() => {
      Object.defineProperty(authService, 'currentUser$', {
        value: of({ id: 1, name: 'Current User' }),
      });
    });

    it('should fetch active users on refresh', fakeAsync(() => {
      userService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));

      service.refreshActiveUsers();
      tick();

      expect(userService.getRecentlyActiveUsers).toHaveBeenCalled();
      expect(service.activeUsers()).toEqual(mockUsers);
    }));

    it('should poll for active users', fakeAsync(() => {
      userService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));

      tick(0);
      expect(userService.getRecentlyActiveUsers).toHaveBeenCalledTimes(1);
      expect(service.activeUsers()).toEqual(mockUsers);

      tick(60000);
      expect(userService.getRecentlyActiveUsers).toHaveBeenCalledTimes(2);

      tick(60000);
      expect(userService.getRecentlyActiveUsers).toHaveBeenCalledTimes(3);
    }));

    it('should handle errors when fetching active users', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
      });
      userService.getRecentlyActiveUsers.and.returnValue(
        throwError(() => errorResponse)
      );

      service.refreshActiveUsers();
      tick();

      expect(notificationService.showError).toHaveBeenCalledWith(
        'У вас немає дозволу на перегляд активних користувачів'
      );
      expect(service.activeUsers()).toEqual(
        jasmine.objectContaining({
          error: jasmine.objectContaining({
            message: 'У вас немає дозволу на перегляд активних користувачів',
          }),
        })
      );
    }));

    it('should handle generic errors', fakeAsync(() => {
      userService.getRecentlyActiveUsers.and.returnValue(
        throwError(() => new Error('Error'))
      );

      service.refreshActiveUsers();
      tick();

      expect(notificationService.showError).toHaveBeenCalledWith(
        'Не вдалося завантажити активних користувачів'
      );
    }));
  });

  describe('without authenticated user', () => {
    it('should not fetch active users', fakeAsync(() => {
      userService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));

      service.refreshActiveUsers();
      tick();

      expect(userService.getRecentlyActiveUsers).not.toHaveBeenCalled();
      expect(service.activeUsers()).toBeNull();
    }));
  });

  it('should cleanup on destroy', () => {
    spyOn(service['destroy$'], 'next');
    spyOn(service['destroy$'], 'complete');

    service.ngOnDestroy();

    expect(service['destroy$'].next).toHaveBeenCalled();
    expect(service['destroy$'].complete).toHaveBeenCalled();
  });
});
