import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewComponent } from './overview.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MockProvider } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { ResearchAnalyticsComponent } from '../research-analytics/research-analytics.component';
import { AuthService } from '@core/authentication/auth.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let analyticsService: AnalyticsService;
  let notificationService: NotificationService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        LoaderComponent,
        NgxChartsModule,
        OverviewComponent,
      ],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            systemOverview: () =>
              of({
                totalUsers: 150,
                activeUsers: 42,
                totalProjects: 75,
                activeSessions: 28,
              }),
            userGrowth: () => of([{ date: '2023-01-01', newUsers: 5 }]),
            projectDistribution: () =>
              of({
                publicationCount: 30,
                patentCount: 20,
                researchCount: 25,
              }),
            loading: () => false,
            error: () => null,
            getSystemOverview: jest.fn().mockReturnValue(of({})),
            getUserGrowth: jest.fn().mockReturnValue(of([])),
            getProjectDistribution: jest.fn().mockReturnValue(of({})),
            refreshAll: jest.fn(),
          },
        },
        MockProvider(NotificationService),
        MockProvider(AuthService, {
          isAuthenticated: jest.fn().mockReturnValue(true),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    analyticsService = TestBed.inject(AnalyticsService);
    notificationService = TestBed.inject(NotificationService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data if authenticated', () => {
    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(analyticsService.getSystemOverview).toHaveBeenCalled();
    expect(analyticsService.getUserGrowth).toHaveBeenCalled();
    expect(analyticsService.getProjectDistribution).toHaveBeenCalled();
  });

  it('should display system overview data', () => {
    const overviewElements = fixture.debugElement.queryAll(
      By.css('[matTooltip^="Total registered users"]')
    );
    expect(overviewElements.length).toBeGreaterThan(0);
    expect(overviewElements[0].nativeElement.textContent).toContain('150');
  });

  it('should process user growth data for chart', (done) => {
    component.userGrowthChart$.subscribe((data) => {
      expect(data[0].name).toBe('Зростання кількості користувачів');
      expect(data[0].series[0].value).toBe(5);
      done();
    });
  });

  it('should process project distribution data for chart', (done) => {
    component.projectDistributionChart$.subscribe((data) => {
      expect(data.length).toBe(3);
      expect(data[0].name).toBe('Публікації');
      expect(data[0].value).toBe(30);
      done();
    });
  });

  it('should handle refresh all data', () => {
    const refreshBtn = fixture.debugElement.query(
      By.css('button[mat-icon-button]')
    );
    refreshBtn.triggerEventHandler('click', null);

    expect(analyticsService.refreshAll).toHaveBeenCalled();
  });

  it('should show error message when data loading fails', () => {
    jest
      .spyOn(analyticsService, 'getSystemOverview')
      .mockReturnValue(throwError(() => new Error('Failed')));
    component.loadData();

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити дані про огляд системи'
    );
  });

  it('should show loader when loading', () => {
    jest.spyOn(analyticsService, 'loading').mockReturnValue(true);
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.directive(LoaderComponent));
    expect(loader).toBeTruthy();
  });

  it('should show error component when error exists', () => {
    jest.spyOn(analyticsService, 'error').mockReturnValue('Test error');
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorElement).toBeTruthy();
  });
});
