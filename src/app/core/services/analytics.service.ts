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
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { NotificationService } from './notification.service';

type AnalyticsEndpoint = {
  [K in keyof AnalyticsService]: K extends `get${infer T}`
    ? Uncapitalize<T>
    : never;
}[keyof AnalyticsService];

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = BASE_URL + 'admin/analytics';
  private destroy$ = new Subject<void>();

  readonly systemOverview = signal<SystemOverviewDTO | null>(null);
  readonly userGrowth = signal<UserGrowthDTO[] | null>(null);
  readonly projectDistribution = signal<ProjectDistributionDTO | null>(null);
  readonly projectProgress = signal<ProjectProgressDTO[] | null>(null);
  readonly publicationMetrics = signal<PublicationMetricsDTO | null>(null);
  readonly patentMetrics = signal<PatentMetricsDTO | null>(null);
  readonly researchFunding = signal<ResearchFundingDTO | null>(null);
  readonly commentActivity = signal<CommentActivityDTO[] | null>(null);
  readonly systemPerformance = signal<SystemPerformanceDTO | null>(null);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private fetchData<T>(
    endpoint: AnalyticsEndpoint,
    signalFn: (value: T | null) => void,
    params?: HttpParams,
    mapper?: (data: T) => T
  ): Observable<T | null> {
    console.log(`Starting request to ${endpoint}`);

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params }).pipe(
      tap((response) => console.log(`Response from ${endpoint}:`, response)),
      map((response) => (mapper ? mapper(response) : response ?? null)),
      tap((data) => {
        signalFn(data);
        this.loading.set(false);
        console.log(`Completed request to ${endpoint}`);
      }),
      catchError((err) => {
        console.error(`Error in ${endpoint}:`, err);
        return this.handleError(endpoint, signalFn)(err);
      }),
      finalize(() => {
        this.loading.set(false);
        console.log(`Finalized request to ${endpoint}`);
      })
    );
  }

  private handleError<T>(
    operation: string,
    signalFn: (value: T | null) => void
  ) {
    return (error: any): Observable<T | null> => {
      console.error(`${operation} failed:`, error);
      const errorMessage = this.getErrorMessage(error, operation);
      this.notificationService.showError(errorMessage);
      this.error.set(errorMessage);
      signalFn(null);
      this.loading.set(false);
      return of(null);
    };
  }

  private getErrorMessage(error: any, operation: string): string {
    if (error.status === 0) {
      return 'Помилка мережі: Не вдалося підключитися до служби аналітики';
    }
    if (error.status === 403) {
      return 'Неавторизовано: У вас немає дозволу на перегляд аналітики';
    }
    return `Не вдалося завантажити ${operation
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()}`;
  }

  getSystemOverview(): Observable<SystemOverviewDTO | null> {
    return this.fetchData('systemOverview', this.systemOverview.set);
  }

  getUserGrowth(
    startDate?: string,
    endDate?: string
  ): Observable<UserGrowthDTO[] | null> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.fetchData('userGrowth', this.userGrowth.set, params);
  }

  getProjectDistribution(): Observable<ProjectDistributionDTO | null> {
    return this.fetchData('projectDistribution', this.projectDistribution.set);
  }

  getProjectProgress(): Observable<ProjectProgressDTO[] | null> {
    return this.fetchData('projectProgress', this.projectProgress.set);
  }

  getPublicationMetrics(): Observable<PublicationMetricsDTO | null> {
    return this.fetchData('publicationMetrics', this.publicationMetrics.set);
  }

  getPatentMetrics(): Observable<PatentMetricsDTO | null> {
    return this.fetchData('patentMetrics', this.patentMetrics.set);
  }

  getResearchFunding(): Observable<ResearchFundingDTO | null> {
    return this.fetchData('researchFunding', this.researchFunding.set);
  }

  getCommentActivity(
    days: number = 7
  ): Observable<CommentActivityDTO[] | null> {
    const params = new HttpParams().set('days', days.toString());

    return this.fetchData(
      'commentActivity',
      this.commentActivity.set,
      params,
      (data) => data.map((item) => ({ ...item, date: new Date(item.date) }))
    );
  }

  getSystemPerformance(): Observable<SystemPerformanceDTO | null> {
    return this.fetchData('systemPerformance', this.systemPerformance.set);
  }

  refreshAll(): void {
    this.getSystemOverview().pipe(takeUntil(this.destroy$)).subscribe();
    this.getUserGrowth().pipe(takeUntil(this.destroy$)).subscribe();
    this.getProjectDistribution().pipe(takeUntil(this.destroy$)).subscribe();
    this.getProjectProgress().pipe(takeUntil(this.destroy$)).subscribe();
    this.getPublicationMetrics().pipe(takeUntil(this.destroy$)).subscribe();
    this.getPatentMetrics().pipe(takeUntil(this.destroy$)).subscribe();
    this.getResearchFunding().pipe(takeUntil(this.destroy$)).subscribe();
    this.getCommentActivity().pipe(takeUntil(this.destroy$)).subscribe();
    this.getSystemPerformance().pipe(takeUntil(this.destroy$)).subscribe();
  }
}
