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
          console.error('System overview error:', error);
          this.notificationService.showError('Failed to load system overview');
          return of(null);
        })
      )
      .subscribe();

    this.analyticsService
      .getUserGrowth()
      .pipe(
        catchError((error) => {
          console.error('User growth error:', error);
          this.notificationService.showError('Failed to load user growth data');
          return of(null);
        })
      )
      .subscribe();

    this.analyticsService
      .getProjectDistribution()
      .pipe(
        catchError((error) => {
          console.error('Project distribution error:', error);
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
    map((data) => {
      // Ensure we always have a valid data structure
      const seriesData = Array.isArray(data)
        ? data.map((item) => ({
            name: item?.date ? new Date(item.date).toLocaleDateString() : 'N/A',
            value: item?.newUsers || 0,
          }))
        : [];

      return [
        {
          name: 'User Growth',
          series: seriesData.length
            ? seriesData
            : [{ name: 'No data', value: 0 }],
        },
      ];
    }),
    catchError((error) => {
      console.error('Error processing user growth data:', error);
      this.notificationService.showError('Error processing user growth data');
      return of([
        {
          name: 'User Growth',
          series: [{ name: 'Error loading data', value: 0 }],
        },
      ]);
    })
  );

  projectDistributionChart$ = toObservable(this.projectDistribution).pipe(
    tap({
      error: (error) => {
        console.error('Error processing project distribution:', error);
        this.notificationService.showError('Error processing project data');
      },
    }),
    map((data) => {
      const pubCount = data?.publicationCount ?? 0;
      const patentCount = data?.patentCount ?? 0;
      const researchCount = data?.researchCount ?? 0;

      return [
        { name: 'Publications', value: Math.max(0, pubCount) },
        { name: 'Patents', value: Math.max(0, patentCount) },
        { name: 'Research', value: Math.max(0, researchCount) },
      ].filter((item) => item.value > 0);
    }),
    catchError(() => of([]))
  );
}
