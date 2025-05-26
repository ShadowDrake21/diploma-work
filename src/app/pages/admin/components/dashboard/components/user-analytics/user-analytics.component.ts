import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, map, of } from 'rxjs';

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

  userGrowth$ = toObservable(this.analyticsService.userGrowth);

  userGrowthChart$ = this.userGrowth$.pipe(
    map((data) => [
      {
        name: 'New Users',
        series: data.map((item) => ({
          name: new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          value: item.newUsers,
        })),
      },
      {
        name: 'Active Users',
        series: data.map((item) => ({
          name: new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          value: item.activeUsers,
        })),
      },
    ]),
    catchError(() => of([]))
  );
}
