import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import { safeToLocaleDateString } from '@shared/utils/date.utils';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-user-analytics',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    NgxChartsModule,
    MatProgressSpinnerModule,
    MatIcon,
    LoaderComponent,
  ],
  templateUrl: './user-analytics.component.html',
})
export class UserAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  dateRangeError = signal<string | null>(null);

  userGrowthChart$ = combineLatest([
    toObservable(this.startDate),
    toObservable(this.endDate),
  ]).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(([startDate, endDate]) => {
      this.loading.set(true);
      this.error.set(null);
      this.dateRangeError.set(null);
      if (startDate && endDate && startDate > endDate) {
        this.dateRangeError.set('Дата початку має бути раніше дати завершення');
        this.loading.set(false);
        return;
      }
    }),
    switchMap(([startDate, endDate]) => {
      if (!startDate || !endDate || startDate > endDate) {
        return of(null);
      }

      const start = this.formatDate(startDate);
      const end = this.formatDate(endDate);

      return this.analyticsService.getUserGrowth(start, end).pipe(
        catchError((error) => {
          this.error.set(this.getErrorMessage(error));
          this.notificationService.showError(this.error()!);
          return of(null);
        })
      );
    }),

    map((data) => {
      if (!data) return [];

      return [
        {
          name: 'Нові користувачі',
          series: data!.map((item) => ({
            name: safeToLocaleDateString(item.date),
            value: item.newUsers,
          })),
        },
        {
          name: 'Активні користувачі',
          series: data!.map((item) => ({
            name: safeToLocaleDateString(item.date),
            value: item.activeUsers,
          })),
        },
      ];
    }),
    tap(() => this.loading.set(false)),
    catchError((error) => {
      console.error('Error processing user growth data:', error);
      this.loading.set(false);
      this.error.set('Не вдалося обробити дані користувача');
      this.notificationService.showError(this.error()!);
      return of([]);
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  onStartDateChange(date: Date | null): void {
    this.startDate.set(date);
  }
  onEndDateChange(date: Date | null): void {
    this.endDate.set(date);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Помилка мережі: Не вдалося підключитися до служби аналітики';
    }
    if (error.status === 403) {
      return 'Неавторизовано: У вас немає дозволу на перегляд аналітики користувачів';
    }
    if (error.status === 404) {
      return 'Дані аналітики користувачів не знайдено за вибраний період';
    }
    return 'Не вдалося завантажити дані аналітики користувачів';
  }
}
