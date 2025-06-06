import {
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '@core/services/dashboard.service';
import { NotificationService } from '@core/services/notification.service';
import { DashboardMetricCardItem } from '@shared/types/dashboard.types';
import { MetricCardItemComponent } from '../../../../shared/components/metric-card-item/metric-card-item.component';
import { Subject, takeUntil, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'dashboard-basic-stats',
  imports: [MatProgressSpinnerModule, MatIcon, MetricCardItemComponent],
  templateUrl: './basic-stats.component.html',
  styleUrl: './basic-stats.component.scss',
})
export class BasicStatsComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);
  metricsData = signal<DashboardMetricCardItem[]>([]);

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.dashboardService
      .getDashboardMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          console.log('Dashboard metrics loaded:', metrics);
          this.metricsData.set(this.transformMetrics(metrics));
          this.isLoading.set(false);
        },
        error: (error) => this.handleMetricsLoadError(error),
      });
  }

  private transformMetrics(metrics: any): DashboardMetricCardItem[] {
    return [
      {
        title: 'Усього проектів',
        value: metrics.totalProjects.toString(),
        icon: 'category',
        link: '/projects',
      },
      {
        title: 'Усього публікацій',
        value: metrics.totalPublications.toString(),
        icon: 'description',
        link: '/projects',
      },
      {
        title: 'Усього патентів',
        value: metrics.totalPatents.toString(),
        icon: 'gavel',
        link: '/projects',
      },
      {
        title: 'Усього досліджень',
        value: metrics.totalResearch.toString(),
        icon: 'science',
        link: '/projects',
      },
      {
        title: 'Усього користувачів',
        value: metrics.totalUsers.toString(),
        icon: 'people',
        link: '/users',
      },
    ];
  }

  private handleMetricsLoadError(error: HttpErrorResponse): void {
    console.error('Error loading metrics:', error);
    this.isLoading.set(false);
    this.hasError.set(true);

    let message = 'Failed to load dashboard metrics';
    if (error.status === 0) {
      message = 'Network error: Please check your internet connection';
    }

    this.errorMessage.set(message);
    this.notificationService.showError(message);
    this.metricsData.set([]);
  }

  retryLoading() {
    this.loadMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
