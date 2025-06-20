import { TestBed } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { DashboardMetrics } from '@shared/types/dashboard.types';
import { NotificationService } from './notification.service';
import { BASE_URL } from '@core/constants/default-variables';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const baseUrl = `${BASE_URL}/dashboard`;
  const mockMetrics: DashboardMetrics = {
    totalProjects: 10,
    totalPublications: 5,
    totalPatents: 3,
    totalResearch: 7,
    totalUsers: 20,
  };

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboardMetrics', () => {
    it('should fetch dashboard metrics successfully', () => {
      service.getDashboardMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(mockMetrics);
      });

      const req = httpMock.expectOne(`${baseUrl}/metrics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });

    it('should return default metrics and show error on network error', () => {
      service.getDashboardMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(service['defaultMetrics']);
      });

      const req = httpMock.expectOne(`${baseUrl}/metrics`);
      req.error(new ProgressEvent('Network error'));
      expect(notificationService.showError).toHaveBeenCalledWith(
        'Помилка мережі: Не вдалося підключитися до служби інформаційної панелі'
      );
    });

    it('should return default metrics and show error on 403 error', () => {
      service.getDashboardMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(service['defaultMetrics']);
      });

      const req = httpMock.expectOne(`${baseUrl}/metrics`);
      req.flush(null, { status: 403, statusText: 'Forbidden' });
      expect(notificationService.showError).toHaveBeenCalledWith(
        'У вас немає дозволу на перегляд показників інформаційної панелі'
      );
    });

    it('should return default metrics and show error on 500 error', () => {
      service.getDashboardMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(service['defaultMetrics']);
      });

      const req = httpMock.expectOne(`${baseUrl}/metrics`);
      req.flush(null, { status: 500, statusText: 'Server Error' });
      expect(notificationService.showError).toHaveBeenCalledWith(
        'Помилка сервера: Не вдалося завантажити показники інформаційної панелі'
      );
    });

    it('should return default metrics and show generic error for other errors', () => {
      service.getDashboardMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(service['defaultMetrics']);
      });

      const req = httpMock.expectOne(`${baseUrl}/metrics`);
      req.flush(null, { status: 400, statusText: 'Bad Request' });
      expect(notificationService.showError).toHaveBeenCalledWith(
        'Не вдалося завантажити показники інформаційної панелі'
      );
    });
  });

  describe('getErrorMessage', () => {
    it('should return network error message for status 0', () => {
      const error = new HttpErrorResponse({ status: 0 });
      const message = service['getErrorMessage'](error);
      expect(message).toBe(
        'Помилка мережі: Не вдалося підключитися до служби інформаційної панелі'
      );
    });

    it('should return permission error message for status 403', () => {
      const error = new HttpErrorResponse({ status: 403 });
      const message = service['getErrorMessage'](error);
      expect(message).toBe(
        'У вас немає дозволу на перегляд показників інформаційної панелі'
      );
    });

    it('should return server error message for status 500', () => {
      const error = new HttpErrorResponse({ status: 500 });
      const message = service['getErrorMessage'](error);
      expect(message).toBe(
        'Помилка сервера: Не вдалося завантажити показники інформаційної панелі'
      );
    });

    it('should return generic error message for other statuses', () => {
      const error = new HttpErrorResponse({ status: 400 });
      const message = service['getErrorMessage'](error);
      expect(message).toBe(
        'Не вдалося завантажити показники інформаційної панелі'
      );
    });
  });
});
