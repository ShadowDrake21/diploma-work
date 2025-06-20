import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SessionMonitorService } from './session-monitor.service';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { of, throwError } from 'rxjs';

describe('SessionMonitorService', () => {
  let service: SessionMonitorService;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'checkAndRefreshToken',
      'logout',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        SessionMonitorService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(SessionMonitorService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start monitoring on creation', () => {
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(true);
    });

    it('should check and refresh token periodically', fakeAsync(() => {
      authService.checkAndRefreshToken.and.returnValue(of('valid-token'));

      tick(60000);

      expect(authService.checkAndRefreshToken).toHaveBeenCalled();
      expect(authService.logout).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should logout when token check returns null', fakeAsync(() => {
      authService.checkAndRefreshToken.and.returnValue(of(null));

      tick(60000);

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/authentication/sign-in']);
    }));

    it('should logout when token check fails', fakeAsync(() => {
      authService.checkAndRefreshToken.and.returnValue(
        throwError(() => new Error('Check failed'))
      );

      tick(60000);

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/authentication/sign-in']);
    }));
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(false);
    });

    it('should not check token', fakeAsync(() => {
      tick(60000);
      expect(authService.checkAndRefreshToken).not.toHaveBeenCalled();
    }));
  });

  describe('setCheckInterval', () => {
    it('should update check interval', fakeAsync(() => {
      service.setCheckInterval(30000); // 30 seconds
      authService.checkAndRefreshToken.and.returnValue(of('valid-token'));

      tick(30000);

      expect(authService.checkAndRefreshToken).toHaveBeenCalled();
    }));
  });

  it('should stop monitoring on destroy', () => {
    authService.checkAndRefreshToken.and.returnValue(of('valid-token'));
    service.ngOnDestroy();

    expect(authService.checkAndRefreshToken).not.toHaveBeenCalled();
  });
});
