import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { AnalyticsService } from '@core/services/analytics.service';
import { MockProvider } from 'ng-mocks';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let analyticsService: AnalyticsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTabsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        DashboardComponent,
      ],
      providers: [MockProvider(AnalyticsService), provideNativeDateAdapter()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    analyticsService = TestBed.inject(AnalyticsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const title = fixture.debugElement.query(By.css('mat-card-title h1'));
    expect(title.nativeElement.textContent).toContain(
      'Аналітика панелі адміністратора'
    );
  });

  it('should call refreshAll when refresh button is clicked', () => {
    spyOn(component, 'refreshAll');
    const refreshButton = fixture.debugElement.query(
      By.css('button[mat-icon-button]')
    );
    refreshButton.triggerEventHandler('click', null);
    expect(component.refreshAll).toHaveBeenCalled();
  });

  it('should show progress bar when loading', () => {
    analyticsService.loading.set(true);
    fixture.detectChanges();

    const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
    expect(progressBar).toBeTruthy();
  });

  it('should not show progress bar when not loading', () => {
    analyticsService.loading.set(false);
    fixture.detectChanges();

    const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
    expect(progressBar).toBeNull();
  });

  it('should display error message when error exists', () => {
    const testError = 'Test error message';
    analyticsService.error.set(testError);
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorElement.nativeElement.textContent).toContain(testError);
  });

  it('should call dismissError when close button is clicked', () => {
    analyticsService.error.set('Test error');
    fixture.detectChanges();

    spyOn(component, 'dismissError');
    const closeButton = fixture.debugElement.query(
      By.css('button[mat-icon-button]')
    );
    closeButton.triggerEventHandler('click', null);
    expect(component.dismissError).toHaveBeenCalled();
  });

  it('should contain all expected tabs', () => {
    const tabLabels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
    expect(tabLabels.length).toBe(4);
    expect(tabLabels[0].nativeElement.textContent).toContain('Огляд');
    expect(tabLabels[1].nativeElement.textContent).toContain(
      'Аналітика користувачів'
    );
    expect(tabLabels[2].nativeElement.textContent).toContain(
      'Аналітика досліджень'
    );
    expect(tabLabels[3].nativeElement.textContent).toContain(
      'Системна аналітика'
    );
  });

  it('should call analyticsService.refreshAll when refreshAll is called', () => {
    spyOn(analyticsService, 'refreshAll');
    component.refreshAll();
    expect(analyticsService.refreshAll).toHaveBeenCalled();
  });

  it('should clear error when dismissError is called', () => {
    analyticsService.error.set('Test error');
    component.dismissError();
    expect(analyticsService.error()).toBeNull();
  });
});
