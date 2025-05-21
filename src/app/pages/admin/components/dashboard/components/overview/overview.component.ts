import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatGridListModule } from '@angular/material/grid-list';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
@Component({
  selector: 'app-overview',
  imports: [MatGridListModule, MatCardModule, MatIconModule, NgxChartsModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly analyticsService = inject(AnalyticsService);

  systemOverview = this.analyticsService.systemOverview;
  userGrowth$ = toObservable(this.analyticsService.userGrowth);
  projectDistribution$ = toObservable(
    this.analyticsService.projectDistribution
  );

  userGrowthChart$ = this.userGrowth$.pipe(
    map((data) => [
      {
        name: 'User Growth',
        series: data.map((item) => ({
          name: item.date.toLocaleDateString(),
          value: item.newUsers,
        })),
      },
    ])
  );

  projectDistributionChart$ = this.projectDistribution$.pipe(
    map((data) =>
      data
        ? [
            { name: 'Publications', value: data.publicationCount },
            { name: 'Patents', value: data.patentCount },
            { name: 'Research Projects', value: data.researchCount },
          ]
        : []
    )
  );
}
