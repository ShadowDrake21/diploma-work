import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAnalyticsComponent } from './system-analytics.component';
import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import {
  SystemPerformanceDTO,
  CommentActivityDTO,
} from '@models/analytics.model';
import { IsNanPipe } from '@pipes/is-nan.pipe';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { setupTestBed } from '../utils/analytics-test.helper';

describe('SystemAnalyticsComponent', () => {
  let component: SystemAnalyticsComponent;
  let fixture: ComponentFixture<SystemAnalyticsComponent>;
  let analyticsService: AnalyticsService;
  let notificationService: NotificationService;

  const mockPerformance: SystemPerformanceDTO = {
    averageResponseTime: 150,
    uptimePercentage: 99.99,
    activeConnections: 42,
    memoryUsage: 65.5,
    cpuUsage: 30.2,
    activeDbConnections: 10,
    idleDbConnections: 5,
    maxDbConnections: 20,
    threadCount: 8,
  };

  const mockCommentActivity: CommentActivityDTO[] = [
    {
      date: new Date('2023-01-01'),
      newComments: 15,
      likes: 30,
    },
    {
      date: new Date('2023-01-02'),
      newComments: 20,
      likes: 45,
    },
  ];

  beforeEach(() => {
    return setupTestBed(SystemAnalyticsComponent)
      .keep(IsNanPipe)
      .mock(AnalyticsService, {
        getSystemPerformance: jest.fn(() => of(mockPerformance)),
        getCommentActivity: jest.fn(() => of(mockCommentActivity)),
      });
  });

  beforeEach(() => {
    fixture = MockRender(SystemAnalyticsComponent);
    component = fixture.componentInstance;
    analyticsService = ngMocks.findInstance(AnalyticsService);
    notificationService = ngMocks.findInstance(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load data', () => {
    expect(analyticsService.getSystemPerformance).toHaveBeenCalled();
    expect(analyticsService.getCommentActivity).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  describe('data transformation', () => {
    it('should transform performance data correctly', (done) => {
      const data = component.systemPerformance();
      expect(data).toEqual(mockPerformance);
      done();
    });

    it('should transform comment activity data correctly', (done) => {
      component.commentActivityChart$.subscribe((data) => {
        expect(data).toEqual([
          {
            name: 'Коментарі',
            series: [
              { name: '1/1/2023', value: 15 },
              { name: '1/2/2023', value: 20 },
            ],
          },
          {
            name: 'Лайки',
            series: [
              { name: '1/1/2023', value: 30 },
              { name: '1/2/2023', value: 45 },
            ],
          },
        ]);
        done();
      });
    });

    it('should transform memory usage for gauge chart', (done) => {
      component.memoryUsageGauge$.subscribe((data) => {
        expect(data).toEqual([{ name: "Пам'ять", value: 65.5 }]);
        done();
      });
    });

    it('should transform CPU usage for gauge chart', (done) => {
      component.cpuUsageGauge$.subscribe((data) => {
        expect(data).toEqual([{ name: 'CPU', value: 30.2 }]);
        done();
      });
    });
  });

  describe('error handling', () => {
    it('should handle errors when loading data', () => {
      const error = { status: 500 };
      jest
        .spyOn(analyticsService, 'getSystemPerformance')
        .mockReturnValue(throwError(() => error));

      component.loadData();

      expect(component.error()).toBe(
        'Не вдалося завантажити дані системної аналітики'
      );
      expect(notificationService.showError).toHaveBeenCalled();
    });

    it('should handle network errors', () => {
      const error = { status: 0 };
      jest
        .spyOn(analyticsService, 'getSystemPerformance')
        .mockReturnValue(throwError(() => error));

      component.loadData();

      expect(component.error()).toBe(
        'Помилка мережі: Не вдалося підключитися до служби аналітики'
      );
    });

    it('should handle 403 errors', () => {
      const error = { status: 403 };
      jest
        .spyOn(analyticsService, 'getSystemPerformance')
        .mockReturnValue(throwError(() => error));

      component.loadData();

      expect(component.error()).toBe(
        'Неавторизовано: У вас немає дозволу на перегляд аналітики'
      );
    });
  });

  describe('retry functionality', () => {
    it('should retry loading data when retry is called', () => {
      const error = { status: 500 };
      jest
        .spyOn(analyticsService, 'getSystemPerformance')
        .mockReturnValue(throwError(() => error));

      component.loadData();
      expect(component.error()).toBeTruthy();

      jest
        .spyOn(analyticsService, 'getSystemPerformance')
        .mockReturnValue(of(mockPerformance));
      component.retry();

      expect(component.error()).toBeNull();
      expect(analyticsService.getSystemPerformance).toHaveBeenCalledTimes(2);
    });
  });
});
