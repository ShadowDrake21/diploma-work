import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AnalyticsService } from '@core/services/analytics.service';
import { OverviewComponent } from './components/overview/overview.component';
import { ProjectAnalyticsComponent } from './components/project-analytics/project-analytics.component';
import { ResearchAnalyticsComponent } from './components/research-analytics/research-analytics.component';
import { SystemAnalyticsComponent } from './components/system-analytics/system-analytics.component';
import { UserAnalyticsComponent } from './components/user-analytics/user-analytics.component';

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
    ProjectAnalyticsComponent,
    ResearchAnalyticsComponent,
    SystemAnalyticsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class DashboardComponent {
  private readonly analyticsService = inject(AnalyticsService);

  refreshAll(): void {
    this.analyticsService.refreshAll();
  }
}
