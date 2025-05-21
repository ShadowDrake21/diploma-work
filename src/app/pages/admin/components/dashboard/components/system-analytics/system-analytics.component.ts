import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { map } from 'rxjs';

@Component({
  selector: 'app-system-analytics',
  imports: [MatCardModule, MatGridListModule, NgxChartsModule],
  templateUrl: './system-analytics.component.html',
  styleUrl: './system-analytics.component.scss',
})
export class SystemAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);
  systemPerformace = this.analyticsService.systemPerformance;
  commentActivity$ = toObservable(this.analyticsService.commentActivity);

  commentActivityChart$ = this.commentActivity$.pipe(
    map((data) => [
      {
        name: 'Comments',
        series: data.map((item) => ({
          name: item.date.toLocaleDateString(),
          value: item.newComments,
        })),
      },
      {
        name: 'Likes',
        series: data.map((item) => ({
          name: item.date.toLocaleDateString(),
          value: item.likes,
        })),
      },
    ])
  );
}
