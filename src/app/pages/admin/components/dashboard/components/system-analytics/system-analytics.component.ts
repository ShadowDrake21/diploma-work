import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService } from '@core/services/analytics.service';
import { safeToLocaleDateString } from '@shared/utils/date.utils';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
  catchError,
  EMPTY,
  forkJoin,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { IsNanPipe } from '@pipes/is-nan.pipe';

@Component({
  selector: 'app-system-analytics',
  imports: [
    MatCardModule,
    MatGridListModule,
    NgxChartsModule,
    MatIcon,
    MatProgressSpinnerModule,
    LoaderComponent,
    IsNanPipe,
  ],
  templateUrl: './system-analytics.component.html',
})
export class SystemAnalyticsComponent implements OnInit, OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private destroy$ = new Subject<void>();

  systemPerformance = this.analyticsService.systemPerformance;
  commentActivity = this.analyticsService.commentActivity;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  memoryUsageGauge$ = toObservable(this.systemPerformance).pipe(
    map((perf) => [
      {
        name: "Пам'ять",
        value: perf?.memoryUsage || 0,
      },
    ]),
    catchError(() => {
      this.error.set("Не вдалося завантажити дані про використання пам'яті");
      return of([{ name: "Пам'ять", value: 0 }]);
    })
  );

  cpuUsageGauge$ = toObservable(this.systemPerformance).pipe(
    map((perf) => [
      {
        name: 'CPU',
        value: perf?.cpuUsage ? Number(perf.cpuUsage) : 0,
      },
    ]),
    catchError(() => {
      this.error.set('Не вдалося завантажити дані про використання процесора');
      return of([{ name: 'CPU', value: 0 }]);
    })
  );

  commentActivityChart$ = toObservable(this.commentActivity).pipe(
    map((data) => {
      if (!data || data.length === 0) {
        return [
          {
            name: 'Коментарі',
            series: [],
          },
          {
            name: 'Лайки',
            series: [],
          },
        ];
      }

      return [
        {
          name: 'Коментарі',
          series: data!.map((item) => ({
            name: safeToLocaleDateString(item.date),
            value: item.newComments || 0,
          })),
        },
        {
          name: 'Лайки',
          series: data!.map((item) => ({
            name: safeToLocaleDateString(item.date),
            value: item.likes || 0,
          })),
        },
      ];
    }),
    catchError(() => {
      this.error.set('Не вдалося завантажити дані про коментарі');
      return of([
        { name: 'Коментарі', series: [] },
        { name: 'Лайки', series: [] },
      ]);
    })
  );

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin([
      this.analyticsService.getSystemPerformance(),
      this.analyticsService.getCommentActivity(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
      this.error.set(
        'Помилка мережі: Не вдалося підключитися до служби аналітики'
      );
    } else if (error.status === 403) {
      this.error.set(
        'Неавторизовано: У вас немає дозволу на перегляд аналітики'
      );
    } else {
      this.error.set('Не вдалося завантажити дані системної аналітики');
    }
  }

  retry() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
