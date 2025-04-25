import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardMetricsContent } from '@content/dashboardMetrics.content';
import { MetricCardItemComponent } from '@shared/components/metric-card-item/metric-card-item.component';
import { recentProjectContent } from '@content/recentProjects.content';
import { RecentProjectComponent } from './components/recent-project/recent-project.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { FrequentLinksComponent } from '@shared/components/frequent-links/frequent-links.component';
import { Project } from '@shared/types/project.types';
import { ProjectService } from '@core/services/project.service';
import { Subscription } from 'rxjs';
import { DashboardService } from '@core/services/dashboard.service';
import {
  DashboardMetricCardItem,
  DashboardMetrics,
} from '@shared/types/dashboard.types';

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
export class DashboardComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private dashboardService = inject(DashboardService);

  isLoading = true;

  newestProjects: Project[] = [];
  metricsData: DashboardMetricCardItem[] = [];
  ngOnInit(): void {
    this.loadNewsestProjects();
    this.loadMetrics();
  }

  // recentProjects = [
  //   ...recentProjectContent,
  //   ...recentProjectContent.splice(0, 5),
  // ];

  subscriptions: Subscription[] = [];

  loadNewsestProjects() {
    const subscription = this.projectService.getNewestProjects(6).subscribe({
      next: (projects) => {
        this.newestProjects = projects;
      },
      error: (error) => {
        console.error('Error fetching newest projects:', error);
      },
    });
    this.subscriptions.push(subscription);
  }

  loadMetrics() {
    const subscription = this.dashboardService.getDashboardMetrics().subscribe({
      next: (metrics) => {
        this.metricsData = [
          {
            title: 'Total Products',
            value: metrics.totalProjects.toString(),
            icon: 'category',
            link: '/products',
          },
          {
            title: 'Total Publications',
            value: metrics.totalPublications.toString(),
            icon: 'description',
            link: '/publications',
          },
          {
            title: 'Total Patents',
            value: metrics.totalPatents.toString(),
            icon: 'gavel',
            link: '/patents',
          },
          {
            title: 'Total Research Projects',
            value: metrics.totalResearch.toString(),
            icon: 'science',
            link: '/research-projects',
          },
          {
            title: 'Total Users',
            value: metrics.totalUsers.toString(),
            icon: 'people',
            link: '/users',
          },
        ];

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching dashboard metrics:', error);
        this.isLoading = false;
      },
    });
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
