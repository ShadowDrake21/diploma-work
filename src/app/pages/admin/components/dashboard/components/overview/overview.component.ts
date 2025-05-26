import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatGridListModule } from '@angular/material/grid-list';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-overview',
  imports: [
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    NgxChartsModule,
    MatProgressSpinnerModule,
  ],
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

  ngOnInit() {
    this.analyticsService.getSystemOverview().subscribe();
    this.analyticsService.getUserGrowth().subscribe();
    this.analyticsService.getProjectDistribution().subscribe();
  }

  userGrowthChart$ = this.userGrowth$.pipe(
    map((data) => [
      {
        name: 'User Growth',
        series: data.map((item) => ({
          name: item?.date ? new Date(item.date).toLocaleDateString() : 'N/A',
          value: item?.newUsers || 0,
        })),
      },
    ]),
    catchError(() => of([]))
  );

  projectDistributionChart$ = this.projectDistribution$.pipe(
    map((data) => {
      if (!data) return [];

      return [
        { name: 'Publications', value: data.publicationCount || 0 },
        { name: 'Patents', value: data.patentCount || 0 },
        { name: 'Research', value: data.researchCount || 0 },
      ].filter((item) => item.value > 0);
    }),
    catchError(() => of([]))
  );
}
