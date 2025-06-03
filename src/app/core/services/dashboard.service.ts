import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { DashboardMetrics } from '@shared/types/dashboard.types';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  private apiUrl = BASE_URL + 'dashboard';

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http
      .get<DashboardMetrics>(`${this.apiUrl}/metrics`, getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('Error fetching dashboard metrics:', error);
          return of({
            totalProjects: 0,
            totalPublications: 0,
            totalPatents: 0,
            totalResearch: 0,
            totalUsers: 0,
          });
        })
      );
  }
}
