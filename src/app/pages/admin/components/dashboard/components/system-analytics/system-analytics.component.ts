import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { map } from 'rxjs';

@Component({
  selector: 'app-system-analytics',
  imports: [MatCardModule, MatGridListModule, NgxChartsModule, MatIcon],
  templateUrl: './system-analytics.component.html',
  styleUrl: './system-analytics.component.scss',
})
export class SystemAnalyticsComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  systemPerformance$ = toObservable(this.analyticsService.systemPerformance);
  commentActivity$ = toObservable(this.analyticsService.commentActivity);

  memoryUsageGauge$ = this.systemPerformance$.pipe(
    map((perf) => [
      {
        name: 'Memory',
        value: perf?.memoryUsage || 0,
      },
    ])
  );

  cpuUsageGauge$ = this.systemPerformance$.pipe(
    map((perf) => [
      {
        name: 'CPU',
        value: perf?.cpuUsage || 0,
      },
    ])
  );

  commentActivityChart$ = this.commentActivity$.pipe(
    map((data) => [
      {
        name: 'Comments',
        series: data.map((item) => ({
          name: this.safeToLocaleDateString(item.date),
          value: item.newComments,
        })),
      },
      {
        name: 'Likes',
        series: data.map((item) => ({
          name: this.safeToLocaleDateString(item.date),
          value: item.likes,
        })),
      },
    ])
  );

  private safeToLocaleDateString(date: any): string {
    try {
      const dateObj = new Date(date);
      return isNaN(dateObj.getTime())
        ? 'Invalid Date'
        : dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  ngOnInit() {
    this.analyticsService.getSystemPerformance().subscribe();
    this.analyticsService.getCommentActivity().subscribe();
  }
}
