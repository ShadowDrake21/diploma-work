import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AnalyticsService } from '@core/services/analytics.service';
import { OverviewComponent } from './components/overview/overview.component';
import { ResearchAnalyticsComponent } from './components/research-analytics/research-analytics.component';
import { SystemAnalyticsComponent } from './components/system-analytics/system-analytics.component';
import { UserAnalyticsComponent } from './components/user-analytics/user-analytics.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    OverviewComponent,
    UserAnalyticsComponent,
    ResearchAnalyticsComponent,
    MatProgressBarModule,
    SystemAnalyticsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class DashboardComponent {
  private readonly analyticsService = inject(AnalyticsService);

  get loading() {
    return this.analyticsService.loading();
  }

  get error() {
    return this.analyticsService.error();
  }

  refreshAll(): void {
    this.analyticsService.refreshAll();
  }

  dismissError(): void {
    this.analyticsService.error.set(null);
  }
}
