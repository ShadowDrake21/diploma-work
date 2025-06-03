import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AnalyticsService } from '@core/services/analytics.service';
import { safeToLocaleDateString } from '@shared/utils/date.utils';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-user-analytics',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    NgxChartsModule,
  ],
  templateUrl: './user-analytics.component.html',
  styleUrl: './user-analytics.component.scss',
})
export class UserAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);

  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  userGrowth$ = toObservable(this.analyticsService.userGrowth);

  userGrowthChart$ = combineLatest([
    toObservable(this.startDate),
    toObservable(this.endDate),
  ]).pipe(
    switchMap(([startDate, endDate]) => {
      const start = startDate ? this.formatDate(startDate) : undefined;
      const end = endDate ? this.formatDate(endDate) : undefined;
      return this.analyticsService.getUserGrowth(start, end);
    }),

    map((data) => [
      {
        name: 'New Users',
        series: data.map((item) => ({
          name: safeToLocaleDateString(item.date),
          value: item.newUsers,
        })),
      },
      {
        name: 'Active Users',
        series: data.map((item) => ({
          name: safeToLocaleDateString(item.date),
          value: item.activeUsers,
        })),
      },
    ]),
    catchError(() => of([]))
  );

  onStartDateChange(date: Date | null): void {
    this.startDate.set(date);
  }
  onEndDateChange(date: Date | null): void {
    this.endDate.set(date);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
