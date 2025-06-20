import { TestBed } from '@angular/core/testing';

import { AttachmentsService } from './attachments.service';
import { AuthService } from '@core/authentication/auth.service';
import { of } from 'rxjs';
import { AppInitializerService } from './app-initializer.service';
import { UserStore } from './stores/user-store.service';

describe('AttachmentsService', () => {
  describe('AppInitializerService', () => {
    let service: AppInitializerService;
    let authServiceMock: jest.Mocked<AuthService>;
    let userStoreMock: jest.Mocked<UserStore>;

    beforeEach(() => {
      authServiceMock = {
        isAuthenticated: jest.fn(),
        checkAndRefreshToken: jest.fn(),
      } as any;

      userStoreMock = {
        initializeCurrentUser: jest.fn(),
      } as any;

      TestBed.configureTestingModule({
        providers: [
          AppInitializerService,
          { provide: AuthService, useValue: authServiceMock },
          { provide: UserStore, useValue: userStoreMock },
        ],
      });

      service = TestBed.inject(AppInitializerService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('initialize', () => {
      it('should resolve immediately when not authenticated', (done) => {
        authServiceMock.isAuthenticated.mockReturnValue(false);

        service.initialize().then(() => {
          expect(authServiceMock.checkAndRefreshToken).not.toHaveBeenCalled();
          expect(userStoreMock.initializeCurrentUser).not.toHaveBeenCalled();
          done();
        });
      });

      it('should initialize user when authenticated', (done) => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.checkAndRefreshToken.mockReturnValue(of(null));

        service.initialize().then(() => {
          expect(authServiceMock.checkAndRefreshToken).toHaveBeenCalled();
          expect(userStoreMock.initializeCurrentUser).toHaveBeenCalled();
          done();
        });
      });

      it('should handle error during token refresh', (done) => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.checkAndRefreshToken.mockReturnValue(of(null));

        service.initialize().then(() => {
          expect(authServiceMock.checkAndRefreshToken).toHaveBeenCalled();
          expect(userStoreMock.initializeCurrentUser).toHaveBeenCalled();
          done();
        });
      });
    });
  });
});
