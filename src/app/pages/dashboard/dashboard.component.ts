import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardMetricsContent } from '@content/dashboardMetrics.content';
import { MetricCardItemComponent } from './components/metric-card-item/metric-card-item.component';
import { recentProjectContent } from '@content/recentProjects.content';
import { RecentProjectComponent } from './components/recent-project/recent-project.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { FrequentLinksComponent } from '@shared/components/frequent-links/frequent-links.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatSidenavModule,
    MatListModule,
    CommonModule,
    MatIconModule,
    MetricCardItemComponent,
    RecentProjectComponent,
    ProjectCardComponent,
    FilterSidebarComponent,
    FrequentLinksComponent,
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
