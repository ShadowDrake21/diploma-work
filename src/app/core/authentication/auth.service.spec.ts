import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.service';
import { NotificationService } from '@core/services/notification.service';
import { UserRole } from '@shared/enums/user.enum';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  IAuthResponse,
  ILoginRequest,
  IRegisterRequest,
  IRequestPasswordReset,
  IResetPasswordRequest,
  IVerifyRequest,
} from '@shared/types/auth.types';
import { ApplicationError } from '@core/errors/application-error';

const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;

  const baseUrl = 'http://localhost:8080/api/auth';
  const mockToken = 'mock.token.123';
  const mockDecodedToken = {
    sub: '1',
    userId: 1,
    role: UserRole.USER,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    email: 'test@example.com',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([]),
        AuthService,
        {
          provide: NotificationService,
          useValue: {
            showSuccess: jest.fn(),
            showError: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);

    localStorage.clear();
    sessionStorage.clear();

    mockJwtDecode.mockImplementation(() => mockDecodedToken);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  const mockLoginResponse = (rememberMe: boolean = false) => {
    const response: IAuthResponse = {
      authToken: mockToken,
      message: 'Login successful',
    };
    const req = httpMock.expectOne(`${baseUrl}/login`);
    req.flush(response);
    return req;
  };

  const mockRefreshResponse = (success: boolean = true) => {
    const req = httpMock.expectOne(`${baseUrl}/refresh-token`);
    if (success) {
      req.flush({ authToken: 'new.mock.token' });
    } else {
      req.error(new ProgressEvent('error'));
    }
    return req;
  };

  describe('Core Functionality', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should get token from storage', () => {
      localStorage.setItem('authToken', mockToken);
      expect(service.getToken()).toBe(mockToken);
    });

    it('should decode token', () => {
      const decoded = service.decodeToken(mockToken);
      expect(decoded).toEqual(mockDecodedToken);
      expect(mockJwtDecode).toHaveBeenCalledWith(mockToken);
    });

    it('should return null for invalid token', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      expect(service.decodeToken('invalid.token')).toBeNull();
    });

    it('should check if authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
      localStorage.setItem('authToken', mockToken);
      expect(service.isAuthenticated()).toBe(true);

      const expiredToken = {
        ...mockDecodedToken,
        exp: Math.floor(Date.now() / 1000) - 3600,
      };

      mockJwtDecode.mockImplementation(() => expiredToken);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should get current user', () => {
      localStorage.setItem('authToken', mockToken);
      expect(service.getCurrentUser()).toEqual(mockDecodedToken);
    });

    it('should get user role', () => {
      localStorage.setItem('authToken', mockToken);
      expect(service.getUserRole()).toBe(UserRole.USER);
    });

    it('should check admin status', () => {
      expect(service.isAdmin()).toBe(false);

      const adminToken = { ...mockDecodedToken, role: UserRole.ADMIN };
      mockJwtDecode.mockImplementation(() => adminToken);
      localStorage.setItem('authToken', mockToken);
      expect(service.isAdmin()).toBe(true);
    });

    it('should check super admin status', () => {
      expect(service.isSuperAdmin()).toBe(false);

      const superAdminToken = {
        ...mockDecodedToken,
        role: UserRole.SUPER_ADMIN,
      };
      mockJwtDecode.mockImplementation(() => superAdminToken);
      localStorage.setItem('authToken', mockToken);
      expect(service.isSuperAdmin()).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should login successfully and store token', fakeAsync(() => {
      const credentials: ILoginRequest = {
        email: 'test@example.com',
        password: 'password',
        rememberMe: true,
      };

      service.login(credentials).subscribe((response) => {
        expect(response.authToken).toBe(mockToken);
        expect(localStorage.getItem('authToken')).toBe(mockToken);
        expect(sessionStorage.getItem('authToken')).toBeNull();
        expect(service.getCurrentUser()).toEqual(mockDecodedToken);
      });
      mockLoginResponse(true);
      tick();
    }));

    it('should login and use sessionStorage when rememberMe is false', fakeAsync(() => {
      const credentials: ILoginRequest = {
        email: 'test@example.com',
        password: 'password',
        rememberMe: true,
      };

      service.login(credentials).subscribe(() => {
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(sessionStorage.getItem('authToken')).toBe(mockToken);
      });

      mockLoginResponse(false);
      tick();
    }));

    it('should handle login error', fakeAsync(() => {
      const credentials: ILoginRequest = {
        email: 'test@example.com',
        password: 'wrong',
        rememberMe: false,
      };
      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeInstanceOf(ApplicationError);
          expect(error.message).toBe('Invalid credentials');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' }
      );
      tick();
    }));

    it('should register successfully', fakeAsync(() => {
      const userData: IRegisterRequest = {
        email: 'new@example.com',
        password: 'password',
        username: 'newuser',
        role: UserRole.USER,
      };
      const response = 'User registered successfully';

      service.register(userData).subscribe((res) => {
        expect(res).toBe(response);
      });

      const req = httpMock.expectOne(`${baseUrl}/register`);
      expect(req.request.method).toBe('POST');
      req.flush(response);
      tick();
    }));

    it('should verify user successfully', fakeAsync(() => {
      const verifyData: IVerifyRequest = {
        email: 'test@example.com',
        code: '123456',
      };

      service.verifyUser(verifyData).subscribe((response) => {
        expect(response).toBeTruthy();
        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'User verified successfully'
        );
      });
      const req = httpMock.expectOne(`${baseUrl}/verify`);
      expect(req.request.method).toBe('POST');
      req.flush({ authToken: mockToken });
      tick();
    }));

    it('should logout successfully', fakeAsync(() => {
      localStorage.setItem('authToken', mockToken);
      spyOn(service['router'], 'navigate');

      service.logout();

      const req = httpMock.expectOne(`${baseUrl}/logout`);
      req.flush('Logged out');
      tick();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(service['currentUserSubject'].value).toBeNull();
      expect(service['router'].navigate).toHaveBeenCalledWith([
        '/authentication/sign-in',
      ]);
    }));

    it('should clear auth data even if logout fails', fakeAsync(() => {
      localStorage.setItem('authToken', mockToken);
      spyOn(service['router'], 'navigate');

      service.logout();

      const req = httpMock.expectOne(`${baseUrl}/logout`);
      req.error(new ProgressEvent('error'));
      tick();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(service['router'].navigate).toHaveBeenCalledWith([
        '/authentication/sign-in',
      ]);
    }));
  });

  describe('Token Management', () => {
    it('should refresh token successfully', fakeAsync(() => {
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('rememberSession', 'true');

      service.refreshToken().subscribe((token) => {
        expect(token).toBe('new.mock.token');
        expect(localStorage.getItem('authToken')).toBe('new.mock.token');
      });
      mockRefreshResponse();
      tick();
    }));

    it('should handle token refresh failure', fakeAsync(() => {
      localStorage.setItem('authToken', mockToken);
      service.refreshToken().subscribe((token) => {
        expect(token).toBeNull();
      });

      mockRefreshResponse(false);
      tick();
    }));

    it('should check and refresh token when needed', fakeAsync(() => {
      const nearExpireToken = {
        ...mockDecodedToken,
        exp: Math.floor((Date.now() + 10 * 60 * 1000) / 1000),
      };

      mockJwtDecode.mockImplementation(() => nearExpireToken);
      localStorage.setItem('authToken', mockToken);

      let emittedToken: any = null;
      service.checkAndRefreshToken().subscribe((token) => {
        emittedToken = token;
      });

      mockRefreshResponse();
      tick();

      expect(emittedToken).toBe('new.mock.token');
    }));

    it('should not refresh token if still valid', fakeAsync(() => {
      const validToken = {
        ...mockDecodedToken,
        exp: Math.floor((Date.now() + 20 * 60 * 1000) / 1000),
      };

      mockJwtDecode.mockImplementation(() => validToken);
      localStorage.setItem('authToken', mockToken);

      service.checkAndRefreshToken().subscribe((token) => {
        expect(token).toBe(mockToken);
      });

      httpMock.expectNone(`${baseUrl}/refresh-token`);
      tick();
    }));

    it('should clear auth data if token is expired', fakeAsync(() => {
      const expiredToken = {
        ...mockDecodedToken,
        exp: Math.floor((Date.now() - 1000) / 1000),
      };
      mockJwtDecode.mockImplementation(() => expiredToken);
      localStorage.setItem('authToken', mockToken);

      spyOn(service as any, 'clearAuthData');

      service.checkAndRefreshToken().subscribe((token) => {
        expect(token).toBeNull();
        expect(service['clearAuthData']).toHaveBeenCalled();
      });
      tick();
    }));

    it('should calculate token time left correctly', () => {
      const now = Date.now();
      const token = {
        ...mockDecodedToken,
        exp: Math.floor((now + 3600 * 1000) / 1000),
      };

      const timeLeft = service.getTokenTimeLeft(token);
      expect(timeLeft).toBeCloseTo(3600 * 1000, -3);
    });

    it('should check token expiration', () => {
      const validToken = {
        ...mockDecodedToken,
        exp: Math.floor((Date.now() + 1000) / 1000),
      };
      expect(service.isTokenExpired(validToken)).toBe(false);

      const expiredToken = {
        ...mockDecodedToken,
        exp: Math.floor((Date.now() - 1000) / 1000),
      };
      expect(service.isTokenExpired(expiredToken)).toBe(true);
    });
  });

  describe('Password Reset', () => {
    it('should request password reset successfully', fakeAsync(() => {
      const request: IRequestPasswordReset = { email: 'test@example.com' };
      const response = 'Reset email sent';
      service.requestPasswordReset(request).subscribe((res) => {
        expect(res).toBe(response);
      });

      const req = httpMock.expectOne(`${baseUrl}/request-password-reset`);
      expect(req.request.method).toBe('POST');
      req.flush(response);
      tick();
    }));

    it('should reset password successfully', fakeAsync(() => {
      const request: IResetPasswordRequest = {
        token: 'reset-token',
        newPassword: 'newPassword',
      };

      const response = 'Password reset successfully';
      service.resetPassword(request).subscribe((res) => {
        expect(res).toBe(response);
      });

      const req = httpMock.expectOne(`${baseUrl}/reset-password`);
      expect(req.request.method).toBe('POST');
      req.flush(response);
      tick();
    }));
  });

  describe('Errro Handling', () => {
    it('should handle rate limit error', fakeAsync(() => {
      const credentials: ILoginRequest = {
        email: 'test@example.com',
        password: 'password',
        rememberMe: false,
      };

      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeInstanceOf(ApplicationError);
          expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
          expect(error.message).toContain('Будь ласка, спробуйте ще раз через');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(null, {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'Retry-After': '60',
        },
      });
      tick();
    }));

    it('should handle server error with message', fakeAsync(() => {
      const credentials: ILoginRequest = {
        email: 'test@example.com',
        password: 'password',
        rememberMe: false,
      };

      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeInstanceOf(ApplicationError);
          expect(error.message).toBe('Invalide credentials');
          expect(error.code).toBe('AUTH_ERROR');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(
        { message: 'Invalide credentials', errorCode: 'AUTH_ERROR' },
        {
          status: 401,
          statusText: 'Unauthorized',
        }
      );
      tick();
    }));

    it('should handle unexpected error', fakeAsync(() => {
      const credentials: ILoginRequest = {
        email: 'test@example.com',
        password: 'password',
        rememberMe: false,
      };

      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeInstanceOf(ApplicationError);
          expect(error.message).toBe('Сталася неочікувана помилка');
          expect(error.code).toBe('SERVER_ERROR');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.error(new ProgressEvent('error'));
      tick();
    }));
  });

  describe('Storage Management', () => {
    it('should clear auth data', () => {
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('rememberSession', 'true');
      sessionStorage.setItem('authToken', mockToken);
      service.clearAuthData();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('rememberSession')).toBeNull();
      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(service['currentUserSubject'].value).toBeNull();
      expect(service['isAdminSig']()).toBe(false);
    });

    it('should remember session setting', () => {
      service.setRememberSession(true);
      expect(localStorage.getItem('rememberSession')).toBe('true');

      service.setRememberSession(false);
      expect(localStorage.getItem('rememberSession')).toBe('false');
    });

    it('should get remember session setting', () => {
      localStorage.setItem('rememberSession', 'true');
      expect(service.getRememberSession()).toBe(true);

      localStorage.setItem('rememberSession', 'false');
      expect(service.getRememberSession()).toBe(false);
    });
  });

  describe('Signals', () => {
    it('should update admin signal on login', fakeAsync(() => {
      const adminToken = {
        ...mockDecodedToken,
        role: UserRole.ADMIN,
      };
      mockJwtDecode.mockImplementation(() => adminToken);

      const credentials: ILoginRequest = {
        email: 'admin@example.com',
        password: 'password',
        rememberMe: true,
      };

      service.login(credentials).subscribe(() => {
        expect(service['isAdminSig']()).toBe(true);
      });

      mockLoginResponse(true);
      tick();
    }));

    it('should update admin signal on logout', fakeAsync(() => {
      const admingToken = { ...mockDecodedToken, role: UserRole.ADMIN };
      mockJwtDecode.mockImplementation(() => admingToken);
      localStorage.setItem('authToken', mockToken);

      service.logout();
      httpMock.expectOne(`${baseUrl}/logout`).flush('Logged out');
      tick();

      expect(service['isAdminSig']()).toBe(false);
    }));
  });
});
