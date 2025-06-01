import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import {
  SystemOverviewDTO,
  UserGrowthDTO,
  ProjectDistributionDTO,
  ProjectProgressDTO,
  PublicationMetricsDTO,
  PatentMetricsDTO,
  ResearchFundingDTO,
  CommentActivityDTO,
  SystemPerformanceDTO,
} from '@models/analytics.model';
import { ApiResponse } from '@models/api-response.model';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = BASE_URL + 'admin/analytics';

  systemOverview = signal<SystemOverviewDTO | null>(null);
  userGrowth = signal<UserGrowthDTO[] | null>(null);
  projectDistribution = signal<ProjectDistributionDTO | null>(null);
  projectProgress = signal<ProjectProgressDTO[] | null>(null);
  publicationMetrics = signal<PublicationMetricsDTO | null>(null);
  patentMetrics = signal<PatentMetricsDTO | null>(null);
  researchFunding = signal<ResearchFundingDTO | null>(null);
  commentActivity = signal<CommentActivityDTO[] | null>(null);
  systemPerformance = signal<SystemPerformanceDTO | null>(null);

  private handleError<T>(signalFn: (value: T | null) => void) {
    return (error: any): Observable<T | null> => {
      console.error('API Error: ', error);
      signalFn(null);
      return of(null);
    };
  }

  getSystemOverview(): Observable<SystemOverviewDTO | null> {
    return this.http
      .get<ApiResponse<SystemOverviewDTO>>(`${this.apiUrl}/overview`)
      .pipe(
        tap((response) => this.systemOverview.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.systemOverview.set))
      );
  }

  getUserGrowth(
    startDate?: string,
    endDate?: string
  ): Observable<UserGrowthDTO[] | null> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http
      .get<ApiResponse<UserGrowthDTO[]>>(`${this.apiUrl}/users/growth`, {
        params,
      })
      .pipe(
        tap((response) => this.userGrowth.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.userGrowth.set))
      );
  }

  getProjectDistribution(): Observable<ProjectDistributionDTO | null> {
    return this.http
      .get<ApiResponse<ProjectDistributionDTO>>(
        `${this.apiUrl}/projects/distribution`
      )
      .pipe(
        tap((response) => this.projectDistribution.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.projectDistribution.set))
      );
  }

  getProjectProgress(): Observable<ProjectProgressDTO[] | null> {
    return this.http
      .get<ApiResponse<ProjectProgressDTO[]>>(
        `${this.apiUrl}/projects/progress`
      )
      .pipe(
        tap((response) => this.projectProgress.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.projectProgress.set))
      );
  }

  getPublicationMetrics(): Observable<PublicationMetricsDTO | null> {
    return this.http
      .get<ApiResponse<PublicationMetricsDTO>>(`${this.apiUrl}/publications`)
      .pipe(
        tap((response) => this.publicationMetrics.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.publicationMetrics.set))
      );
  }

  getPatentMetrics(): Observable<PatentMetricsDTO | null> {
    return this.http
      .get<ApiResponse<PatentMetricsDTO>>(`${this.apiUrl}/patents`)
      .pipe(
        tap((response) => this.patentMetrics.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.patentMetrics.set))
      );
  }

  getResearchFunding(): Observable<ResearchFundingDTO | null> {
    return this.http
      .get<ApiResponse<ResearchFundingDTO>>(`${this.apiUrl}/research/funding`)
      .pipe(
        tap((response) => this.researchFunding.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.researchFunding.set))
      );
  }

  getCommentActivity(
    days: number = 7
  ): Observable<CommentActivityDTO[] | null> {
    return this.http
      .get<ApiResponse<CommentActivityDTO[]>>(
        `${this.apiUrl}/comments/activity`,
        {
          params: new HttpParams().set('days', days.toString()),
        }
      )
      .pipe(
        map((response) => ({
          ...response,
          data: response.data!.map((item) => ({
            ...item,
            date: new Date(item.date),
          })),
        })),
        tap((response) => this.commentActivity.set(response.data)),
        map((response) => response.data!),
        catchError(this.handleError(this.commentActivity.set))
      );
  }

  getSystemPerformance(): Observable<SystemPerformanceDTO | null> {
    return this.http
      .get<ApiResponse<SystemPerformanceDTO>>(
        `${this.apiUrl}/system/performance`
      )
      .pipe(
        tap((response) => this.systemPerformance.set(response.data!)),
        map((response) => response.data!),
        catchError(this.handleError(this.systemPerformance.set))
      );
  }

  refreshAll(): void {
    this.getSystemOverview().subscribe();
    this.getUserGrowth().subscribe();
    this.getProjectDistribution().subscribe();
    this.getProjectProgress().subscribe();
    this.getPublicationMetrics().subscribe();
    this.getPatentMetrics().subscribe();
    this.getResearchFunding().subscribe();
    this.getCommentActivity().subscribe();
    this.getSystemPerformance().subscribe();
  }
}
