import { TestBed } from '@angular/core/testing';

import { NotificationService, NotificationType } from './notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should display snackbar with correct configuration', () => {
      const message = 'Test message';
      const type = NotificationType.SUCCESS;
      const duration = 3000;

      service.show(message, type, duration);

      expect(snackBarMock.open).toHaveBeenCalledWith(
        message,
        '❌',
        jasmine.objectContaining({
          duration: duration,
          panelClass: [`notification-${type}`],
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        })
      );
    });

    it('should use default duration when not provided', () => {
      service.show('Test');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        jasmine.objectContaining({ duration: 5000 })
      );
    });
  });

  describe('convenience methods', () => {
    it('showSuccess should call show with SUCCESS type', () => {
      spyOn(service, 'show');
      service.showSuccess('Success!');
      expect(service.show).toHaveBeenCalledWith(
        'Success!',
        NotificationType.SUCCESS,
        5000
      );
    });

    it('showError should call show with ERROR type', () => {
      spyOn(service, 'show');
      service.showError('Error!');
      expect(service.show).toHaveBeenCalledWith(
        'Error!',
        NotificationType.ERROR,
        5000
      );
    });

    it('showWarning should call show with WARNING type', () => {
      spyOn(service, 'show');
      service.showWarning('Warning!');
      expect(service.show).toHaveBeenCalledWith(
        'Warning!',
        NotificationType.WARNING,
        5000
      );
    });

    it('showInfo should call show with INFO type', () => {
      spyOn(service, 'show');
      service.showInfo('Info!');
      expect(service.show).toHaveBeenCalledWith(
        'Info!',
        NotificationType.INFO,
        5000
      );
    });

    it('should allow custom duration in convenience methods', () => {
      spyOn(service, 'show');
      service.showSuccess('Success!', 2000);
      expect(service.show).toHaveBeenCalledWith(
        'Success!',
        NotificationType.SUCCESS,
        2000
      );
    });
  });

  // Uncomment if you implement translation functionality
  // describe('translated notifications', () => {
  //   it('showTranslated should use translation service', () => {
  //     const translateMock = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  //     translateMock.get.and.returnValue(of('Translated text'));
  //     spyOn(service, 'show');

  //     service.showTranslated('translation.key');

  //     expect(translateMock.get).toHaveBeenCalledWith('translation.key', undefined);
  //     expect(service.show).toHaveBeenCalledWith('Translated text', NotificationType.INFO, 5000);
  //   });

  //   it('showTranslatedSuccess should use translation service with SUCCESS type', () => {
  //     const translateMock = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  //     translateMock.get.and.returnValue(of('Translated success'));
  //     spyOn(service, 'show');

  //     service.showTranslatedSuccess('success.key');

  //     expect(service.show).toHaveBeenCalledWith('Translated success', NotificationType.SUCCESS, 5000);
  //   });
  // });
});
