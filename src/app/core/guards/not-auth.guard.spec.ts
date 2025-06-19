import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { notAuthGuard } from './not-auth.guard';
import { AuthService } from '@core/authentication/auth.service';

describe('notAuthGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockRoute = {} as any;
  const mockState = {} as any;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => notAuthGuard(...guardParameters));

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when not authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(false);
    expect(executeGuard(mockRoute, mockState)).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to home when authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);
    expect(executeGuard(mockRoute, mockState)).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return false and navigate when authentication check throws error', () => {
    authServiceMock.isAuthenticated.and.throwError('Error');
    expect(executeGuard(mockRoute, mockState)).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
