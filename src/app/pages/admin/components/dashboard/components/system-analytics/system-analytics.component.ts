import { Component, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import { safeToLocaleDateString } from '@shared/utils/date.utils';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, EMPTY, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-system-analytics',
  imports: [
    MatCardModule,
    MatGridListModule,
    NgxChartsModule,
    MatIcon,
    MatProgressSpinnerModule,
  ],
  templateUrl: './system-analytics.component.html',
  styleUrl: './system-analytics.component.scss',
})
export class SystemAnalyticsComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  systemPerformance = this.analyticsService.systemPerformance;
  commentActivity = this.analyticsService.commentActivity;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  memoryUsageGauge$ = toObservable(this.systemPerformance).pipe(
    map((perf) => [
      {
        name: 'Memory',
        value: perf?.memoryUsage || 0,
      },
    ]),
    catchError(() => {
      this.error.set('Failed to load memory usage data');
      return of([{ name: 'Memory', value: 0 }]);
    })
  );

  cpuUsageGauge$ = toObservable(this.systemPerformance).pipe(
    map((perf) => [
      {
        name: 'CPU',
        value: perf?.cpuUsage || 0,
      },
    ]),
    catchError(() => {
      this.error.set('Failed to load CPU usage data');
      return of([{ name: 'CPU', value: 0 }]);
    })
  );

  commentActivityChart$ = toObservable(this.commentActivity).pipe(
    map((data) => {
      if (!data) return [];

      return [
        {
          name: 'Comments',
          series: data!.map((item) => ({
            name: safeToLocaleDateString(item.date),
            value: item.newComments,
          })),
        },
        {
          name: 'Likes',
          series: data!.map((item) => ({
            name: safeToLocaleDateString(item.date),
            value: item.likes,
          })),
        },
      ];
    }),
    catchError(() => {
      this.error.set('Failed to load comment activity data');
      return of([]);
    })
  );

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin([
      this.analyticsService.getSystemPerformance(),
      this.analyticsService.getCommentActivity(),
    ]).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.handleDataLoadError(err);
        this.loading.set(false);
      },
    });
  }

  private handleDataLoadError(error: any) {
    console.error('Failed to load analytics data:', error);
    this.loading.set(false);

    if (error.status === 0) {
      this.error.set('Network error: Unable to connect to analytics service');
    } else if (error.status === 403) {
      this.error.set(
        'Unauthorized: You do not have permission to view analytics'
      );
    } else {
      this.error.set('Failed to load system analytics data');
    }
  }

  retry() {
    this.loadData();
  }
}
