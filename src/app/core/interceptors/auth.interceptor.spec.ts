import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockRequest = new HttpRequest('GET', '/api/test');
  const mockHandler: HttpHandlerFn = (req) => {
    return of(new HttpResponse({ status: 200 }));
  };

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getToken',
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

  it('should add authorization header when token exists', () => {
    authServiceMock.getToken.and.returnValue('test-token');

    const interceptor = TestBed.runInInjectionContext(() =>
      authInterceptor(mockRequest, mockHandler)
    );

    interceptor.subscribe(() => {
      expect(authServiceMock.getToken).toHaveBeenCalled();

      const modifiedRequest = mockRequest.clone({
        setHeaders: {
          Authorization: 'Bearer test-token',
        },
      });
      expect(mockHandler).toHaveBeenCalledWith(modifiedRequest);
    });
  });

  it('should not add authorization header when no token exists', () => {
    authServiceMock.getToken.and.returnValue(null);

    const interceptor = TestBed.runInInjectionContext(() =>
      authInterceptor(mockRequest, mockHandler)
    );

    interceptor.subscribe(() => {
      expect(authServiceMock.getToken).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
    });
  });

  it('should handle 401 error by logging out and redirecting', () => {
    const errorResponse = new HttpResponse({ status: 401 });
    const errorHandler: HttpHandlerFn = () => throwError(() => errorResponse);

    TestBed.runInInjectionContext(() =>
      authInterceptor(mockRequest, errorHandler)
    ).subscribe({
      error: () => {
        expect(authServiceMock.logout).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith([
          '/authentication/sign-in',
        ]);
      },
    });
  });

  it('should handle 403 error by clearing auth and redirecting', () => {
    const errorResponse = new HttpResponse({ status: 403 });
    const errorHandler: HttpHandlerFn = () => throwError(() => errorResponse);

    TestBed.runInInjectionContext(() =>
      authInterceptor(mockRequest, errorHandler)
    ).subscribe({
      error: () => {
        expect(authServiceMock.logout).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/forbidden']);
      },
    });
  });

  it('should rethrow non-auth errors', () => {
    const errorResponse = new HttpResponse({ status: 500 });
    const errorHandler: HttpHandlerFn = () => throwError(() => errorResponse);

    TestBed.runInInjectionContext(() =>
      authInterceptor(mockRequest, errorHandler)
    ).subscribe({
      error: (error) => {
        expect(error).toEqual(errorResponse);
        expect(authServiceMock.logout).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
      },
    });
  });
});
