import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { DashboardMetrics } from '@shared/types/dashboard.types';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, Observable, of } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = BASE_URL + 'dashboard';

  private defaultMetrics: DashboardMetrics = {
    totalProjects: 0,
    totalPublications: 0,
    totalPatents: 0,
    totalResearch: 0,
    totalUsers: 0,
  };

  getDashboardMetrics(): Observable<DashboardMetrics> {
    const url = `${this.apiUrl}/metrics$`;

    return this.http.get<DashboardMetrics>(url, getAuthHeaders()).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(error);
        this.notificationService.showError(errorMessage);
        console.error('Dashboard metrics error:', error);
        return of(this.defaultMetrics);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Network error: Unable to connect to dashboard service';
      case 403:
        return 'You do not have permission to view dashboard metrics';
      case 500:
        return 'Server error: Failed to load dashboard metrics';
      default:
        return 'Failed to load dashboard metrics';
    }
  }
}
