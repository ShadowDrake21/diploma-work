import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-project-analytics',
  imports: [
    MatCardModule,
    MatGridListModule,
    NgxChartsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './project-analytics.component.html',
  styleUrl: './project-analytics.component.scss',
})
export class ProjectAnalyticsComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  projectDistribution = this.analyticsService.projectDistribution;
  projectProgress = this.analyticsService.projectProgress;

  projectDistributionChart$ = toObservable(this.projectDistribution).pipe(
    map((data) => {
      return [
        { name: 'Publications', value: data?.publicationCount || 0 },
        { name: 'Patents', value: data?.patentCount || 0 },
        { name: 'Research', value: data?.researchCount || 0 },
      ].filter((item) => item.value > 0);
    }),
    catchError(() => of([]))
  );

  projectProgressChart$ = toObservable(this.projectProgress).pipe(
    map((data) => {
      if (!data || !Array.isArray(data)) return [];

      const series = data
        .filter((item) => item != null)
        .map((item) => ({
          name: `${Math.max(0, Math.min(100, item.progress ?? 0))}%`,
          value: item.count ?? 0,
        }));

      return series.length ? [{ name: 'Project Progress', series }] : [];
    }),
    catchError(() => of([]))
  );

  ngOnInit() {
    this.analyticsService.getProjectDistribution().subscribe();
    this.analyticsService.getProjectProgress().subscribe();
  }
}
