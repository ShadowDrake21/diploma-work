import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { BasicStatsComponent } from './basic-stats.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '@core/services/dashboard.service';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MetricCardItemComponent } from '@shared/components/metric-card-item/metric-card-item.component';
import { of, throwError } from 'rxjs';

describe('BasicStatsComponent', () => {
  let component: BasicStatsComponent;
  let fixture: ComponentFixture<BasicStatsComponent>;
  let dashboardServiceMock: jasmine.SpyObj<DashboardService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockMetrics = {
    totalProjects: 10,
    totalPublications: 20,
    totalPatents: 5,
    totalResearch: 15,
    totalUsers: 50,
  };

  beforeEach(async () => {
    dashboardServiceMock = jasmine.createSpyObj('DashboardService', [
      'getDashboardMetrics',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        BasicStatsComponent,
        MatProgressSpinnerModule,
        MatIconModule,
        MetricCardItemComponent,
        LoaderComponent,
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicStatsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load metrics on init', fakeAsync(() => {
    dashboardServiceMock.getDashboardMetrics.and.returnValue(of(mockMetrics));

    fixture.detectChanges(); // Triggers ngOnInit
    tick();

    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeFalse();
    expect(component.metricsData().length).toBe(5);
    expect(component.metricsData()[0].title).toBe('Усього проектів');
  }));

  it('should handle metrics load error', fakeAsync(() => {
    const errorResponse = new HttpErrorResponse({
      error: 'Test error',
      status: 500,
    });
    dashboardServiceMock.getDashboardMetrics.and.returnValue(
      throwError(() => errorResponse)
    );

    fixture.detectChanges();
    tick();

    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeTrue();
    expect(component.errorMessage()).toBe(
      'Не вдалося завантажити показники інформаційної панелі'
    );
    expect(notificationServiceMock.showError).toHaveBeenCalled();
  }));

  it('should handle network error', fakeAsync(() => {
    const errorResponse = new HttpErrorResponse({
      error: 'Network error',
      status: 0,
    });
    dashboardServiceMock.getDashboardMetrics.and.returnValue(
      throwError(() => errorResponse)
    );

    fixture.detectChanges();
    tick();

    expect(component.errorMessage()).toBe(
      'Помилка мережі: Перевірте підключення до Інтернету'
    );
  }));

  it('should retry loading metrics', fakeAsync(() => {
    dashboardServiceMock.getDashboardMetrics.and.returnValue(of(mockMetrics));

    // Initial error state
    component.hasError.set(true);
    component.errorMessage.set('Test error');

    component.retryLoading();
    tick();

    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeFalse();
    expect(component.metricsData().length).toBe(5);
  }));

  it('should transform metrics correctly', () => {
    const transformed = component.transformMetrics(mockMetrics);

    expect(transformed.length).toBe(5);
    expect(transformed[0]).toEqual({
      title: 'Усього проектів',
      value: '10',
      icon: 'category',
      link: '/projects',
    });
    expect(transformed[4]).toEqual({
      title: 'Усього користувачів',
      value: '50',
      icon: 'people',
      link: '/users',
    });
  });

  it('should clean up on destroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');

    fixture.destroy();

    expect(component.destroy$.next).toHaveBeenCalled();
    expect(component.destroy$.complete).toHaveBeenCalled();
  });
});
