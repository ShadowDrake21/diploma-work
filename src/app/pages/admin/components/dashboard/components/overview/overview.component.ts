import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatGridListModule } from '@angular/material/grid-list';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, of, tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OverviewHasDataPipe } from '@pipes/overview-has-data.pipe';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/authentication/auth.service';
@Component({
  selector: 'app-overview',
  imports: [
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    NgxChartsModule,
    MatProgressSpinnerModule,
    OverviewHasDataPipe,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

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
        catchError((error) => {
          this.notificationService.showError('Failed to load system overview');
          return of(null);
        })
      )
      .subscribe();

    this.analyticsService
      .getUserGrowth()
      .pipe(
        catchError((error) => {
          this.notificationService.showError('Failed to load user growth data');
          return of(null);
        })
      )
      .subscribe();

    this.analyticsService
      .getProjectDistribution()
      .pipe(
        catchError((error) => {
          this.notificationService.showError(
            'Failed to load project distribution'
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
    tap({
      error: (error) => {
        console.error('Error processing user growth data:', error);
        this.notificationService.showError('Error processing user growth data');
      },
    }),
    map((data) => ({
      name: 'User Growth',
      series: (data || []).map((item) => ({
        name: item?.date ? new Date(item.date).toLocaleDateString() : 'N/A',
        value: item?.newUsers || 0,
      })),
    })),
    catchError(() => of({ name: 'User Growth', series: [] }))
  );

  projectDistributionChart$ = toObservable(this.projectDistribution).pipe(
    tap({
      error: (error) => {
        console.error('Error processing project distribution:', error);
        this.notificationService.showError('Error processing project data');
      },
    }),
    map((data) =>
      [
        { name: 'Publications', value: data?.publicationCount || 0 },
        { name: 'Patents', value: data?.patentCount || 0 },
        { name: 'Research', value: data?.researchCount || 0 },
      ].filter((item) => item.value >= 0)
    ),
    catchError(() => of([]))
  );
}
