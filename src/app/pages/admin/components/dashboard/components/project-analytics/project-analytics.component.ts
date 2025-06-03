import { Component, inject, signal, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { AnalyticsService } from '@core/services/analytics.service';
import {
  ProjectDistribution,
  ProjectProgressItem,
} from '@shared/types/analytics.types';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-project-analytics',
  imports: [MatCardModule, MatGridListModule, NgxChartsModule],
  templateUrl: './project-analytics.component.html',
  styleUrl: './project-analytics.component.scss',
})
export class ProjectAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);

  projectDistribution$ = toObservable(
    this.analyticsService.projectDistribution ??
      signal({
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
      })
  );
  projectProgress$ = toObservable(
    this.analyticsService.projectProgress ?? signal([])
  );

  projectDistributionChart$ = this.projectDistribution$.pipe(
    map((data) => {
      const safeData = {
        publicationCount: data?.publicationCount ?? 0,
        patentCount: data?.patentCount ?? 0,
        researchCount: data?.researchCount ?? 0,
      };

      return [
        { name: 'Publications', value: safeData.publicationCount },
        { name: 'Patents', value: safeData.patentCount },
        { name: 'Research', value: safeData.researchCount },
      ].filter((item) => item.value > 0);
    }),
    catchError(() => of([]))
  );

  projectProgressChart$ = this.projectProgress$.pipe(
    map((data) => {
      if (!data || !Array.isArray(data)) return [];

      const series = data
        .filter((item) => item != null) // Filter out null/undefined items
        .map((item) => ({
          name: `${Math.max(0, Math.min(100, item.progress ?? 0))}%`, // Ensure progress is 0-100
          value: item.count ?? 0,
        }));

      return series.length ? [{ name: 'Project Progress', series }] : [];
    }),
    catchError(() => of([]))
  );
}
