import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService } from '@core/services/analytics.service';
import { safeToLocaleDateString } from '@shared/utils/date.utils';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, map, of } from 'rxjs';

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

  memoryUsageGauge$ = toObservable(this.systemPerformance).pipe(
    map((perf) => [
      {
        name: 'Memory',
        value: perf?.memoryUsage || 0,
      },
    ]),
    catchError(() => of([{ name: 'Memory', value: 0 }]))
  );

  cpuUsageGauge$ = toObservable(this.systemPerformance).pipe(
    map((perf) => [
      {
        name: 'CPU',
        value: perf?.cpuUsage || 0,
      },
    ]),
    catchError(() => of([{ name: 'CPU', value: 0 }]))
  );

  commentActivityChart$ = toObservable(this.commentActivity).pipe(
    map((data) => [
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
    ]),
    catchError(() => of([]))
  );

  ngOnInit() {
    this.analyticsService.getSystemPerformance().subscribe();
    this.analyticsService.getCommentActivity().subscribe();
  }
}
