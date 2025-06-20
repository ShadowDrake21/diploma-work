import { TestBed } from '@angular/core/testing';

import { adminGuard } from './admin.guard';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { MockProvider } from 'ng-mocks';

describe('adminGuard', () => {
  let authServiceMock: any;
  let notificationServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: jest.fn(),
      isAdmin: jest.fn(),
    };

    notificationServiceMock = {
      showError: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        MockProvider(AuthService, authServiceMock),
        MockProvider(NotificationService, notificationServiceMock),
      ],
    });
  });

  it('should be created', () => {
    expect(adminGuard).toBeTruthy();
  });

  it('should return false and show error when user is not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    authServiceMock.isAdmin.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard(null as any, null as any)
    );

    expect(result).toBe(false);
    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Будь ласка, увійдіть в систему'
    );
    expect(authServiceMock.isAdmin).not.toHaveBeenCalled();
  });

  it('should return true when user is authenticated and is admin', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.isAdmin.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard(null as any, null as any)
    );

    expect(result).toBe(true);
    expect(notificationServiceMock.showError).not.toHaveBeenCalled();
  });

  it('should return false and show error when user is authenticated but not admin', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.isAdmin.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard(null as any, null as any)
    );

    expect(result).toBe(false);
    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'У вас немає доступу до цієї сторінки'
    );
  });

  it('should call isAdmin only when user is authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    TestBed.runInInjectionContext(() => adminGuard(null as any, null as any));
    expect(authServiceMock.isAdmin).not.toHaveBeenCalled();

    jest.clearAllMocks();

    authServiceMock.isAuthenticated.mockReturnValue(true);
    TestBed.runInInjectionContext(() => adminGuard(null as any, null as any));
    expect(authServiceMock.isAdmin).toHaveBeenCalled();
  });
});
