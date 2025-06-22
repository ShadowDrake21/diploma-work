import { Component, inject, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatGridListModule } from '@angular/material/grid-list';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, of, Subject, takeUntil, tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/authentication/auth.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-overview',
  imports: [
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    NgxChartsModule,
    MatProgressSpinnerModule,
    LoaderComponent,
    MatButtonModule,
  ],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  systemOverview = this.analyticsService.systemOverview;
  userGrowth = this.analyticsService.userGrowth;
  projectDistribution = this.analyticsService.projectDistribution;
  loading = this.analyticsService.loading;
  error = this.analyticsService.error;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadData();
    }
  }

  loadData(): void {
    this.analyticsService
      .getSystemOverview()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('System overview error:', error);
          this.notificationService.showError(
            'Не вдалося завантажити дані про огляд системи'
          );
          return of(null);
        })
      )
      .subscribe();

    this.analyticsService
      .getUserGrowth()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('User growth error:', error);
          this.notificationService.showError(
            'Не вдалося завантажити дані про зростання кількості користувачів'
          );
          return of(null);
        })
      )
      .subscribe();

    this.analyticsService
      .getProjectDistribution()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Project distribution error:', error);
          this.notificationService.showError(
            'Не вдалося завантажити дані розподілу проекту'
          );
          return of(null);
        })
      )
      .subscribe();
  }

  refreshData(): void {
    this.analyticsService.refreshAll();
  }

  userGrowthChart$ = toObservable(this.userGrowth).pipe(
    map((data) => {
      const seriesData = Array.isArray(data)
        ? data.map((item) => ({
            name: item?.date ? new Date(item.date).toLocaleDateString() : 'N/A',
            value: item?.newUsers || 0,
          }))
        : [];

      return [
        {
          name: 'Зростання кількості користувачів',
          series: seriesData.length
            ? seriesData
            : [{ name: 'Немає даних', value: 0 }],
        },
      ];
    }),
    catchError((error) => {
      console.error('Error processing user growth data:', error);
      this.notificationService.showError(
        'Помилка обробки даних про зростання кількості користувачів'
      );
      return of([
        {
          name: 'Зростання кількості користувачів',
          series: [{ name: 'Помилка завантаження даних', value: 0 }],
        },
      ]);
    })
  );

  projectDistributionChart$ = toObservable(this.projectDistribution).pipe(
    tap({
      error: (error) => {
        console.error('Error processing project distribution:', error);
        this.notificationService.showError('Помилка обробки даних проєкту');
      },
    }),
    map((data) => {
      const pubCount = data?.publicationCount ?? 0;
      const patentCount = data?.patentCount ?? 0;
      const researchCount = data?.researchCount ?? 0;

      return [
        { name: 'Публікації', value: Math.max(0, pubCount) },
        { name: 'Патенти', value: Math.max(0, patentCount) },
        { name: 'Дослідження', value: Math.max(0, researchCount) },
      ].filter((item) => item.value > 0);
    }),
    catchError(() => of([]))
  );

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
