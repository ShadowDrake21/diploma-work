import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-research-analytics',
  imports: [
    MatCardModule,
    MatGridListModule,
    NgxChartsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIcon,
    LoaderComponent,
    MatButtonModule,
  ],
  templateUrl: './research-analytics.component.html',
})
export class ResearchAnalyticsComponent implements OnInit, OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyed$ = new Subject<void>();

  researchFunding = this.analyticsService.researchFunding;
  publicationMetrics = this.analyticsService.publicationMetrics;
  patentMetrics = this.analyticsService.patentMetrics;
  loading = this.analyticsService.loading;
  error = this.analyticsService.error;

  ngOnInit() {
    this.loadAllMetrics();
  }

  loadAllMetrics(): void {
    this.analyticsService
      .getResearchFunding()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        error: (error) => {
          console.error('Failed to load research funding data', error);
          this.notificationService.showError(
            'Не вдалося завантажити дані фінансування дослідження'
          );
        },
      });

    this.analyticsService
      .getPublicationMetrics()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        error: (error) => {
          console.error('Failed to load publication metrics', error);
          this.notificationService.showError(
            'Не вдалося завантажити показники публікації'
          );
        },
      });

    this.analyticsService
      .getPatentMetrics()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        error: (error) => {
          console.error('Failed to load patent metrics', error);
          this.notificationService.showError(
            'Не вдалося завантажити показники патентів'
          );
        },
      });
  }

  refreshData(): void {
    this.notificationService.showInfo('Оновлення всіх аналітичних даних...');

    forkJoin([
      this.analyticsService.getResearchFunding(),
      this.analyticsService.getPublicationMetrics(),
      this.analyticsService.getPatentMetrics(),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () =>
          this.notificationService.showSuccess('Вся аналітика оновлена'),
        error: (error) => {
          this.notificationService.showError(
            'Не вдалося оновити деякі аналітичні дані'
          );
          console.error('Refresh error:', error);
        },
      });
  }

  refreshResearchFunding(): void {
    this.notificationService.showInfo(
      'Оновлення показників фінансування досліджень...'
    );
    this.analyticsService
      .getResearchFunding()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () =>
          this.notificationService.showSuccess(
            'Показники фінансування досліджень оновлено'
          ),
        error: (error) => {
          this.notificationService.showError(
            'Не вдалося оновити показники фінансування досліджень'
          );
          console.error('Patent research refresh error:', error);
        },
      });
  }

  refreshPublicationMetrics(): void {
    this.notificationService.showInfo('Оновлення показників публікації...');
    this.analyticsService
      .getPublicationMetrics()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () =>
          this.notificationService.showSuccess('Показники публікації оновлено'),
        error: (error) => {
          this.notificationService.showError(
            'Не вдалося оновити показники публікації'
          );
          console.error('Publication metrics refresh error:', error);
        },
      });
  }

  refreshPatentMetrics(): void {
    this.notificationService.showInfo('Оновлення показників патентів...');
    this.analyticsService
      .getPatentMetrics()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () =>
          this.notificationService.showSuccess('Патентні показники оновлено'),
        error: (error) => {
          this.notificationService.showError(
            'Не вдалося оновити показники патентів'
          );
          console.error('Patent metrics refresh error:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
