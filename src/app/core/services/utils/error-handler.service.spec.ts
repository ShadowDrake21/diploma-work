import { TestBed } from '@angular/core/testing';
import { NotificationService } from '../notification.service';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });

    service = TestBed.inject(ErrorHandlerService);
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleServiceError', () => {
    it('should handle error with message', () => {
      const error = { message: 'Test error' };
      const result = service.handleServiceError(error);

      result.subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Test error'
          );
        },
      });
    });

    it('should handle error with error.message', () => {
      const error = { error: { message: 'Nested error' } };
      const result = service.handleServiceError(error);

      result.subscribe({
        error: (err) => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Nested error'
          );
        },
      });
    });

    it('should use default message when no message provided', () => {
      const error = {};
      const result = service.handleServiceError(error);

      result.subscribe({
        error: () => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'An error occurred'
          );
        },
      });
    });

    it('should use custom default message when provided', () => {
      const error = {};
      const result = service.handleServiceError(error, 'Custom default');

      result.subscribe({
        error: () => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Custom default'
          );
        },
      });
    });
  });

  describe('handleNotFoundError', () => {
    it('should handle not found error with default entity', () => {
      const result = service.handleNotFoundError();

      result.subscribe({
        error: () => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Item not found'
          );
        },
      });
    });

    it('should handle not found error with custom entity', () => {
      const result = service.handleNotFoundError('User');

      result.subscribe({
        error: () => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'User not found'
          );
        },
      });
    });
  });

  describe('handleUnauthorizedError', () => {
    it('should handle unauthorized error', () => {
      const result = service.handleUnauthorizedError();

      result.subscribe({
        error: () => {
          expect(notificationService.showError).toHaveBeenCalledWith(
            'You are not authorized to perform this action'
          );
        },
      });
    });
  });
});
