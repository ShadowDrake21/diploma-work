import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MetricCardItemComponent } from '@shared/components/metric-card-item/metric-card-item.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { ProjectService } from '@core/services/project/models/project.service';
import { forkJoin, map, Subscription, tap } from 'rxjs';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardMetricCardItem } from '@shared/types/dashboard.types';
import { ProjectDTO } from '@models/project.model';
import { OnlineUsersComponent } from './components/online-users/online-users.component';
import { ProjectsQuickLinksComponent } from '../../shared/components/projects-quick-links/projects-quick-links.component';
import { NotificationService } from '@core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatSidenavModule,
    MatListModule,
    CommonModule,
    MatIconModule,
    MetricCardItemComponent,
    ProjectCardComponent,
    OnlineUsersComponent,
    ProjectsQuickLinksComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  host: {
    class: 'dashboard',
  },
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);

  isLoading = true;
  hasError = false;
  errorMessage = '';

  newestProjects: ProjectDTO[] = [];
  metricsData: DashboardMetricCardItem[] = [];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadNewsestProjects();
    this.loadMetrics();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin([this.loadNewsestProjects(), this.loadMetrics()]).subscribe({
      complete: () => (this.isLoading = false),
      error: (error) => {
        this.handleGlobalError(error);
        this.isLoading = false;
      },
    });
  }

  loadNewsestProjects() {
    return this.projectService.getNewestProjects(7).pipe(
      tap({
        next: (projects) => {
          this.newestProjects = projects || [];
        },
        error: (error) => this.handleProjectLoadError(error),
      }),
      map(() => void 0)
    );
  }

  loadMetrics() {
    return this.dashboardService.getDashboardMetrics().pipe(
      tap({
        next: (metrics) => (this.metricsData = this.transformMetrics(metrics)),
        error: (error) => this.handleMetricsLoadError(error),
      }),
      map(() => void 0)
    );
  }

  private transformMetrics(metrics: any): DashboardMetricCardItem[] {
    return [
      {
        title: 'Total Products',
        value: metrics.totalProjects.toString(),
        icon: 'category',
        link: '/projects',
      },
      {
        title: 'Total Publications',
        value: metrics.totalPublications.toString(),
        icon: 'description',
        link: '/projects',
      },
      {
        title: 'Total Patents',
        value: metrics.totalPatents.toString(),
        icon: 'gavel',
        link: '/projects',
      },
      {
        title: 'Total Research Projects',
        value: metrics.totalResearch.toString(),
        icon: 'science',
        link: '/projects',
      },
      {
        title: 'Total Users',
        value: metrics.totalUsers.toString(),
        icon: 'people',
        link: '/users',
      },
    ];
  }

  private handleProjectLoadError(error: HttpErrorResponse): void {
    console.error('Error loading projects:', error);

    let message = 'Failed to load recent projects';
    if (error.status === 0) {
      message = 'Network error: Please check your internet connection';
    } else if (error.status === 404) {
      message = 'No recent projects found';
    }

    this.notificationService.showError(message);
    this.newestProjects = [];
  }

  private handleMetricsLoadError(error: HttpErrorResponse): void {
    console.error('Error loading metrics:', error);

    let message = 'Failed to load dashboard metrics';
    if (error.status === 0) {
      message = 'Network error: Please check your internet connection';
    }

    this.notificationService.showError(message);
    this.metricsData = [];
  }

  private handleGlobalError(error: HttpErrorResponse): void {
    console.error('Dashboard initialization error:', error);
    this.hasError = true;

    if (error.status === 0) {
      this.errorMessage =
        'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status >= 500) {
      this.errorMessage = 'Server error: Please try again later';
    } else {
      this.errorMessage = 'Failed to load dashboard data';
    }

    this.notificationService.showError(this.errorMessage);
  }

  retryLoading(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
