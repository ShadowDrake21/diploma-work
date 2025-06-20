import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { of, throwError } from 'rxjs';
import { tokenInterceptor } from './token.interceptor';

describe('tokenInterceptor', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockRequest = new HttpRequest('GET', '/api/data');
  const mockAuthRequest = new HttpRequest('GET', '/api/auth/login');
  const mockHandler: HttpHandlerFn = (req) => {
    return of(new HttpResponse({ status: 200 }));
  };

  const mockDecodedToken = {
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getToken',
      'decodeToken',
      'isTokenExpired',
      'getTokenTimeLeft',
      'showSessionWarning',
      'clearAuthData',
      'logout',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should bypass auth endpoints', () => {
    const interceptor = TestBed.runInInjectionContext(() =>
      tokenInterceptor(mockAuthRequest, mockHandler)
    );

    interceptor.subscribe(() => {
      expect(mockHandler).toHaveBeenCalledWith(mockAuthRequest);
      expect(authServiceMock.getToken).not.toHaveBeenCalled();
    });
  });

  it('should throw error when no token exists', () => {
    authServiceMock.getToken.and.returnValue(null);

    TestBed.runInInjectionContext(() =>
      tokenInterceptor(mockRequest, mockHandler)
    ).subscribe({
      error: (err) => {
        expect(err.message).toBe('Токен не знайдено');
        expect(authServiceMock.getToken).toHaveBeenCalled();
      },
    });
  });

  it('should throw error when token is invalid', () => {
    authServiceMock.getToken.and.returnValue('invalid-token');
    authServiceMock.decodeToken.and.returnValue(null);

    TestBed.runInInjectionContext(() =>
      tokenInterceptor(mockRequest, mockHandler)
    ).subscribe({
      error: (err) => {
        expect(err.message).toBe('Недійсний або прострочений токен');
        expect(authServiceMock.clearAuthData).toHaveBeenCalled();
      },
    });
  });

  it('should throw error when token is expired', () => {
    authServiceMock.getToken.and.returnValue('expired-token');
    authServiceMock.decodeToken.and.returnValue(mockDecodedToken);
    authServiceMock.isTokenExpired.and.returnValue(true);

    TestBed.runInInjectionContext(() =>
      tokenInterceptor(mockRequest, mockHandler)
    ).subscribe({
      error: (err) => {
        expect(err.message).toBe('Недійсний або прострочений токен');
        expect(authServiceMock.clearAuthData).toHaveBeenCalled();
      },
    });
  });

  it('should show session warning when token is near expiration', () => {
    authServiceMock.getToken.and.returnValue('valid-token');
    authServiceMock.decodeToken.and.returnValue(mockDecodedToken);
    authServiceMock.isTokenExpired.and.returnValue(false);
    authServiceMock.getTokenTimeLeft.and.returnValue(4 * 60 * 1000);

    const interceptor = TestBed.runInInjectionContext(() =>
      tokenInterceptor(mockRequest, mockHandler)
    );

    interceptor.subscribe(() => {
      expect(authServiceMock.showSessionWarning).toHaveBeenCalledWith(
        4 * 60 * 1000
      );
      const modifiedRequest = mockRequest.clone({
        setHeaders: {
          Authorization: 'Bearer valid-token',
        },
      });
      expect(mockHandler).toHaveBeenCalledWith(modifiedRequest);
    });
  });

  it('should add auth header adnd proceed when token is valid', () => {
    authServiceMock.getToken.and.returnValue('valid-token');
    authServiceMock.decodeToken.and.returnValue(mockDecodedToken);
    authServiceMock.isTokenExpired.and.returnValue(false);
    authServiceMock.getTokenTimeLeft.and.returnValue(10 * 60 * 1000);

    const interceptor = TestBed.runInInjectionContext(() =>
      tokenInterceptor(mockRequest, mockHandler)
    );

    interceptor.subscribe(() => {
      expect(authServiceMock.showSessionWarning).not.toHaveBeenCalled();

      const modifiedRequest = mockRequest.clone({
        setHeaders: {
          Authorization: 'Bearer valid-token',
        },
      });
      expect(mockHandler).toHaveBeenCalledWith(modifiedRequest);
    });
  });

  it('should handle 401 error by logging out and redirecting', () => {
    authServiceMock.getToken.and.returnValue('valid-token');
    authServiceMock.decodeToken.and.returnValue(mockDecodedToken);
    authServiceMock.isTokenExpired.and.returnValue(false);

    const errorResponse = new HttpResponse({ status: 401 });
    const errorHandler: HttpHandlerFn = () => throwError(() => errorResponse);

    TestBed.runInInjectionContext(() =>
      tokenInterceptor(mockRequest, errorHandler)
    ).subscribe({
      error: () => {
        expect(authServiceMock.logout).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith([
          '/authentication/sign-in',
        ]);
      },
    });
  });
});
