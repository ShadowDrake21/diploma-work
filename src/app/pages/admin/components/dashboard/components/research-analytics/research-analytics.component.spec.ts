import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchAnalyticsComponent } from './research-analytics.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MockProvider } from 'ng-mocks';
import { of, throwError } from 'rxjs';

describe('ResearchAnalyticsComponent', () => {
  let component: ResearchAnalyticsComponent;
  let fixture: ComponentFixture<ResearchAnalyticsComponent>;
  let analyticsService: AnalyticsService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        LoaderComponent,
        ResearchAnalyticsComponent,
      ],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            researchFunding: () =>
              of({
                totalBudget: 100000,
                averageBudget: 25000,
                activeProjects: 15,
                mostCommonFundingSource: 'Government',
              }),
            publicationMetrics: () =>
              of({
                totalPublications: 42,
                averagePages: 12.5,
                publicationsThisYear: 8,
                mostCommonSource: 'Journal X',
              }),
            patentMetrics: () =>
              of({
                totalPatents: 18,
                averageInventors: 2.5,
                patentsThisYear: 5,
                mostCommonAuthority: 'USPTO',
              }),
            loading: () => false,
            error: () => null,
            getResearchFunding: jest.fn().mockReturnValue(of({})),
            getPublicationMetrics: jest.fn().mockReturnValue(of({})),
            getPatentMetrics: jest.fn().mockReturnValue(of({})),
          },
        },
        MockProvider(NotificationService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchAnalyticsComponent);
    component = fixture.componentInstance;
    analyticsService = TestBed.inject(AnalyticsService);
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all metrics on init', () => {
    expect(analyticsService.getResearchFunding).toHaveBeenCalled();
    expect(analyticsService.getPublicationMetrics).toHaveBeenCalled();
    expect(analyticsService.getPatentMetrics).toHaveBeenCalled();
  });

  it('should display research funding data', () => {
    const fundingElements = fixture.debugElement.queryAll(
      By.css('[matTooltip^="Total allocated budget"]')
    );
    expect(fundingElements.length).toBeGreaterThan(0);
    expect(fundingElements[0].nativeElement.textContent).toContain('$100,000');
  });

  it('should display publication metrics', () => {
    const publicationElements = fixture.debugElement.queryAll(
      By.css('[matTooltip^="Total publications"]')
    );
    expect(publicationElements.length).toBeGreaterThan(0);
    expect(publicationElements[0].nativeElement.textContent).toContain('42');
  });

  it('should display patent metrics', () => {
    const patentElements = fixture.debugElement.queryAll(
      By.css('[matTooltip^="Total patents"]')
    );
    expect(patentElements.length).toBeGreaterThan(0);
    expect(patentElements[0].nativeElement.textContent).toContain('18');
  });

  it('should handle refresh all data', () => {
    const refreshBtn = fixture.debugElement.query(
      By.css('button[mat-icon-button]')
    );
    refreshBtn.triggerEventHandler('click', null);

    expect(notificationService.showInfo).toHaveBeenCalledWith(
      'Оновлення всіх аналітичних даних...'
    );
    expect(analyticsService.getResearchFunding).toHaveBeenCalledTimes(2);
    expect(analyticsService.getPublicationMetrics).toHaveBeenCalledTimes(2);
    expect(analyticsService.getPatentMetrics).toHaveBeenCalledTimes(2);
  });

  it('should handle individual metric refresh', () => {
    const refreshBtns = fixture.debugElement.queryAll(
      By.css('button[mat-icon-button]')
    );
    refreshBtns[1].triggerEventHandler('click', null); // Research funding refresh

    expect(notificationService.showInfo).toHaveBeenCalledWith(
      'Оновлення показників фінансування досліджень...'
    );
    expect(analyticsService.getResearchFunding).toHaveBeenCalledTimes(2);
  });

  it('should show error message when data loading fails', () => {
    jest
      .spyOn(analyticsService, 'getResearchFunding')
      .mockReturnValue(throwError(() => new Error('Failed')));
    component.loadAllMetrics();

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити дані фінансування дослідження'
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
    expect(errorElement.nativeElement.textContent).toContain('Test error');
  });
});
