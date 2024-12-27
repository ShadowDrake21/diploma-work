import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardMetricsContent } from '../../../../content/dashboardMetrics.content';
import { MetricCardItemComponent } from './components/metric-card-item/metric-card-item.component';
import { recentProjectContent } from '../../../../content/recentProjects.content';
import { RecentProjectDialogComponent } from './components/recent-project-dialog/recent-project-dialog.component';
import { RecentProjectComponent } from './components/recent-project/recent-project.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatSidenavModule,
    MatListModule,
    CommonModule,
    MatIconModule,
    MetricCardItemComponent,
    RecentProjectComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  host: {
    class: 'dashboard',
  },
})
export class DashboardComponent {
  metricsData = DashboardMetricsContent;
  recentProjects = recentProjectContent;
}
