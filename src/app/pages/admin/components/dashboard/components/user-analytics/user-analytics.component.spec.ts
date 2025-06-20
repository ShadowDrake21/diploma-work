import { ComponentFixture } from '@angular/core/testing';

import { UserAnalyticsComponent } from './user-analytics.component';
import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import { UserGrowthDTO } from '@models/analytics.model';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { setupTestBed } from '../utils/analytics-test.helper';

describe('UserAnalyticsComponent', () => {
  let component: UserAnalyticsComponent;
  let fixture: ComponentFixture<UserAnalyticsComponent>;
  let analyticsService: AnalyticsService;
  let notificationService: NotificationService;

  const mockData: UserGrowthDTO[] = [
    {
      date: new Date('2023-01-01'),
      newUsers: 5,
      activeUsers: 10,
    },
    {
      date: new Date('2023-01-02'),
      newUsers: 7,
      activeUsers: 15,
    },
  ];

  beforeEach(() => {
    return setupTestBed(UserAnalyticsComponent).mock(AnalyticsService, {
      getUserGrowth: jest.fn(() => of(mockData)),
    });
  });

  beforeEach(() => {
    fixture = MockRender(UserAnalyticsComponent);
    component = fixture.componentInstance;
    analyticsService = ngMocks.findInstance(AnalyticsService);
    notificationService = ngMocks.findInstance(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.startDate()).toBeNull();
    expect(component.endDate()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  describe('date range validation', () => {
    it('should set dateRangeError when start date is after end date', () => {
      const startDate = new Date('2023-01-02');
      const endDate = new Date('2023-01-01');

      component.onStartDateChange(startDate);
      component.onEndDateChange(endDate);

      expect(component.dateRangeError()).toBe(
        'Дата початку має бути раніше дати завершення'
      );
      expect(analyticsService.getUserGrowth).not.toHaveBeenCalled();
    });

    it('should clear dateRangeError when dates are valid', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-02');

      component.onStartDateChange(startDate);
      component.onEndDateChange(endDate);

      expect(component.dateRangeError()).toBeNull();
    });
  });

  describe('data fetching', () => {
    it('should fetch data when valid dates are provided', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-02');

      component.onStartDateChange(startDate);
      component.onEndDateChange(endDate);

      expect(analyticsService.getUserGrowth).toHaveBeenCalledWith(
        '2023-01-01',
        '2023-01-02'
      );
    });

    it('should handle errors from the service', () => {
      const error = { status: 500, message: 'Server error' };
      jest
        .spyOn(analyticsService, 'getUserGrowth')
        .mockReturnValue(throwError(() => error));

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-02');

      component.onStartDateChange(startDate);
      component.onEndDateChange(endDate);

      expect(component.error()).toBe(
        'Не вдалося завантажити дані аналітики користувачів'
      );
      expect(notificationService.showError).toHaveBeenCalled();
    });

    it('should transform data correctly for chart', (done) => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-02');

      component.onStartDateChange(startDate);
      component.onEndDateChange(endDate);

      component.userGrowthChart$.subscribe((data) => {
        expect(data).toEqual([
          {
            name: 'Нові користувачі',
            series: [
              { name: '1/1/2023', value: 5 },
              { name: '1/2/2023', value: 7 },
            ],
          },
          {
            name: 'Активні користувачі',
            series: [
              { name: '1/1/2023', value: 10 },
              { name: '1/2/2023', value: 15 },
            ],
          },
        ]);
        done();
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors', () => {
      const error = { status: 0 };
      jest
        .spyOn(analyticsService, 'getUserGrowth')
        .mockReturnValue(throwError(() => error));

      component.onStartDateChange(new Date('2023-01-01'));
      component.onEndDateChange(new Date('2023-01-02'));

      expect(component.error()).toBe(
        'Помилка мережі: Не вдалося підключитися до служби аналітики'
      );
    });

    it('should handle 403 errors', () => {
      const error = { status: 403 };
      jest
        .spyOn(analyticsService, 'getUserGrowth')
        .mockReturnValue(throwError(() => error));

      component.onStartDateChange(new Date('2023-01-01'));
      component.onEndDateChange(new Date('2023-01-02'));

      expect(component.error()).toBe(
        'Неавторизовано: У вас немає дозволу на перегляд аналітики користувачів'
      );
    });

    it('should handle 404 errors', () => {
      const error = { status: 404 };
      jest
        .spyOn(analyticsService, 'getUserGrowth')
        .mockReturnValue(throwError(() => error));

      component.onStartDateChange(new Date('2023-01-01'));
      component.onEndDateChange(new Date('2023-01-02'));

      expect(component.error()).toBe(
        'Дані аналітики користувачів не знайдено за вибраний період'
      );
    });
  });
});
