import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { map } from 'rxjs';

@Component({
  selector: 'app-project-analytics',
  imports: [MatCardModule, MatGridListModule, NgxChartsModule],
  templateUrl: './project-analytics.component.html',
  styleUrl: './project-analytics.component.scss',
})
export class ProjectAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);

  projectDistribution$ = toObservable(
    this.analyticsService.projectDistribution
  );
  projectProgress$ = toObservable(this.analyticsService.projectProgress);

  projectDistributionChart$ = this.projectDistribution$.pipe(
    map((data) =>
      data
        ? [
            { name: 'Publications', value: data.publicationCount },
            { name: 'Patents', value: data.patentCount },
            { name: 'Research', value: data.researchCount },
          ]
        : []
    )
  );

  projectProgressChart$ = this.projectProgress$.pipe(
    map((data) => [
      {
        name: 'Project Progress',
        series: data.map((item) => ({
          name: `${item.progress}%`,
          value: item.count,
        })),
      },
    ])
  );
}
