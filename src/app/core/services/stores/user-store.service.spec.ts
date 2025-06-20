import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { UserStore } from './user-store.service';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '../notification.service';
import { UserService } from '../users/user.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { of, take, throwError } from 'rxjs';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';

describe('UserStoreService', () => {
  let service: UserStore;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    username: 'Test User',
    role: UserRole.USER,
    affiliation: 'university',
    publicationCount: 1,
    patentCount: 1,
    researchCount: 1,
    tags: [],
    active: true,
  };

  const mockJwtUser: IUser = {
    id: 1,
    email: 'test@example.com',
    username: 'Test User',
    role: UserRole.USER,
    affiliation: 'university',
    publicationCount: 1,
    patentCount: 1,
    researchCount: 1,
    tags: [],
    active: true,
  };

  beforeEach(() => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'getCurrentUser',
      'logout',
      'currentUser$',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showInfo',
      'showError',
    ]);

    // Setup currentUser$ as a BehaviorSubject for testing
    authServiceMock.currentUser$ = jasmine.createSpyObj('currentUser$', [
      'pipe',
      'subscribe',
    ]);

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    service = TestBed.inject(UserStore);
    currentUserSig.set(null);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with loading state false', () => {
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('initializeCurrentUser', () => {
    it('should load user if authenticated and no current user', fakeAsync(() => {
      authServiceMock.isAuthenticated.and.returnValue(true);
      userServiceMock.getCurrentUser.and.returnValue(of(mockUser));
      authServiceMock.getCurrentUser.and.returnValue(mockJwtUser);

      service.initializeCurrentUser();
      tick();

      expect(userServiceMock.getCurrentUser).toHaveBeenCalled();
      expect(currentUserSig()).toEqual({ ...mockUser, ...mockJwtUser });
    }));

    it('should not load user if not authenticated', () => {
      authServiceMock.isAuthenticated.and.returnValue(false);

      service.initializeCurrentUser();

      expect(userServiceMock.getCurrentUser).not.toHaveBeenCalled();
    });

    it('should not load user if already exists', () => {
      currentUserSig.set(mockUser);
      authServiceMock.isAuthenticated.and.returnValue(true);

      service.initializeCurrentUser();

      expect(userServiceMock.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('loadCurrentUser', () => {
    it('should load user and update signal', fakeAsync(() => {
      authServiceMock.isAuthenticated.and.returnValue(true);
      userServiceMock.getCurrentUser.and.returnValue(of(mockUser));
      authServiceMock.getCurrentUser.and.returnValue(mockJwtUser);

      service.loadCurrentUser().pipe(take(1)).subscribe();
      tick();

      expect(service.isLoading()).toBeFalse();
      expect(currentUserSig()).toEqual({ ...mockUser, ...mockJwtUser });
    }));

    it('should handle errors gracefully', fakeAsync(() => {
      authServiceMock.isAuthenticated.and.returnValue(true);
      userServiceMock.getCurrentUser.and.returnValue(
        throwError(() => new Error('Error'))
      );

      service.loadCurrentUser().pipe(take(1)).subscribe();
      tick();

      expect(service.isLoading()).toBeFalse();
      expect(notificationServiceMock.showError).toHaveBeenCalled();
    }));

    it('should not load if already loading', () => {
      authServiceMock.isAuthenticated.and.returnValue(true);
      (service as any)._isLoading.set(true);

      service.loadCurrentUser().pipe(take(1)).subscribe();

      expect(userServiceMock.getCurrentUser).not.toHaveBeenCalled();
    });

    it('should not load if not authenticated', () => {
      authServiceMock.isAuthenticated.and.returnValue(false);

      service.loadCurrentUser().pipe(take(1)).subscribe();

      expect(userServiceMock.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('clearUser', () => {
    it('should clear user signal and logout', () => {
      currentUserSig.set(mockUser);

      service.clearUser();

      expect(currentUserSig()).toBeNull();
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(notificationServiceMock.showInfo).toHaveBeenCalledWith(
        'Ви вийшли з системи.'
      );
    });
  });

  describe('currentUser$ subscription', () => {
    it('should load user when currentUser$ emits a user', fakeAsync(() => {
      const userSubject = jasmine.createSpyObj('currentUser$', [
        'pipe',
        'subscribe',
      ]);
      authServiceMock.currentUser$ = userSubject;

      // Recreate service with new mock
      service = TestBed.inject(UserStore);

      userServiceMock.getCurrentUser.and.returnValue(of(mockUser));
      authServiceMock.getCurrentUser.and.returnValue(mockJwtUser);

      // Simulate user emission
      const callback = userSubject.subscribe.calls.argsFor(0)[0];
      callback(mockJwtUser);
      tick();

      expect(userServiceMock.getCurrentUser).toHaveBeenCalled();
      expect(currentUserSig()).toEqual({ ...mockUser, ...mockJwtUser });
    }));

    it('should clear user when currentUser$ emits null', () => {
      const userSubject = jasmine.createSpyObj('currentUser$', [
        'pipe',
        'subscribe',
      ]);
      authServiceMock.currentUser$ = userSubject;

      service = TestBed.inject(UserStore);
      currentUserSig.set(mockUser);

      const callback = userSubject.subscribe.calls.argsFor(0)[0];
      callback(null);

      expect(currentUserSig()).toBeNull();
    });
  });
});
