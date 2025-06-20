import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AnalyticsService } from './analytics.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '@core/authentication/auth.service';
import { BASE_URL } from '@core/constants/default-variables';
import { NotificationService } from './notification.service';
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

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const apiUrl = BASE_URL + 'admin/analytics';

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });
    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Data Fetching', () => {
    it('should fetch system overview data', () => {
      const mockData: SystemOverviewDTO = {
        totalUsers: 100,
        activeUsers: 25,
        totalProjects: 150,
        activeSessions: 30,
      };

      service.getSystemOverview().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.systemOverview()).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/systemOverview`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should fetch user growth data with parameters', () => {
      const mockData: UserGrowthDTO[] = [
        { date: new Date('2023-01-01'), activeUsers: 10, newUsers: 5 },
        { date: new Date('2023-01-02'), activeUsers: 15, newUsers: 8 },
      ];
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';

      service.getUserGrowth(startDate, endDate).subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.userGrowth()).toEqual(mockData);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/userGrowth?startDate=${startDate}&endDate=${endDate}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should fetch project distribution data', () => {
      const mockData: ProjectDistributionDTO = {
        publicationCount: 10,
        patentCount: 20,
        researchCount: 5,
      };

      service.getProjectDistribution().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.projectDistribution()).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/projectDistribution`);
      req.flush(mockData);
    });

    it('should fetch project progress data', () => {
      const mockData: ProjectProgressDTO[] = [
        { progress: 65, count: 5 },
        { progress: 80, count: 10 },
      ];

      service.getProjectProgress().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.projectProgress()).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/projectProgress`);
      req.flush(mockData);
    });

    it('should fetch publication metrics', () => {
      const mockData: PublicationMetricsDTO = {
        totalPublications: 10,
        averagePages: 10,
        mostCommonSource: 'new source',
        publicationsThisYear: 10,
      };

      service.getPublicationMetrics().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.publicationMetrics()).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/publicationMetrics`);
      req.flush(mockData);
    });

    it('should fetch patent metrics', () => {
      const mockData: PatentMetricsDTO = {
        totalPatents: 10,
        averageInventors: 10,
        mostCommonAuthority: 'new',
        patentsThisYear: 10,
      };

      service.getPatentMetrics().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.patentMetrics()).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/patentMetrics`);
      req.flush(mockData);
    });

    it('should fetch research funding data', () => {
      const mockData: ResearchFundingDTO = {
        totalBudget: 100000,
        averageBudget: 1000,
        mostCommonFundingSource: 'network',
        activeProjects: 10,
      };

      service.getResearchFunding().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.researchFunding()).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/researchFunding`);
      req.flush(mockData);
    });

    it('should fetch comment activity with date transformation', () => {
      const mockData: CommentActivityDTO[] = [
        { date: new Date('2023-01-01T00:00:00Z'), newComments: 5, likes: 10 },
        { date: new Date('2023-01-02T00:00:00Z'), newComments: 8, likes: 15 },
      ];
      const expectedData = mockData;

      service.getCommentActivity(7).subscribe((data) => {
        expect(data).toEqual(expectedData);
        expect(service.commentActivity()).toEqual(expectedData);
      });

      const req = httpMock.expectOne(`${apiUrl}/commentActivity?days=7`);
      req.flush(mockData);
    });

    it('should fetch system performance data', () => {
      const mockData: SystemPerformanceDTO = {
        averageResponseTime: 200,
        uptimePercentage: 99.9,
        activeConnections: 50,
        memoryUsage: 2048,
        cpuUsage: 75,
        activeDbConnections: 10,
        idleDbConnections: 5,
        maxDbConnections: 20,
        threadCount: 100,
      };

      service.getSystemPerformance().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(service.systemPerformance()).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/systemPerformance`);
      req.flush(mockData);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      service.getSystemOverview().subscribe((data) => {
        expect(data).toBeNull();
        expect(service.error()).toContain('Помилка мережі');
        expect(notificationService.showError).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${apiUrl}/systemOverview`);
      req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should handle unauthorized errors', () => {
      service.getSystemOverview().subscribe((data) => {
        expect(data).toBeNull();
        expect(service.error()).toContain('Неавторизовано');
        expect(notificationService.showError).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${apiUrl}/systemOverview`);
      req.error(new ProgressEvent('error'), { status: 403 });
    });

    it('should handle generic errors', () => {
      service.getSystemOverview().subscribe((data) => {
        expect(data).toBeNull();
        expect(service.error()).toContain('Не вдалося завантажити');
        expect(notificationService.showError).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${apiUrl}/systemOverview`);
      req.error(new ProgressEvent('error'), { status: 500 });
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during request', fakeAsync(() => {
      let loadingStates: boolean[] = [];

      const initialLoadingState = service.loading();
      loadingStates.push(initialLoadingState);

      service.getSystemOverview().subscribe(() => {
        loadingStates.push(service.loading());
      });

      loadingStates.push(service.loading());

      const req = httpMock.expectOne(`${apiUrl}/systemOverview`);
      req.flush({});
      tick();

      loadingStates.push(service.loading());

      expect(loadingStates).toEqual([false, true, false]);
    }));
  });

  describe('refreshAll', () => {
    it('should refresh all data endpoints', fakeAsync(() => {
      const mockData = {};

      const requests: string[] = [];

      service.getSystemOverview().subscribe();
      service.getUserGrowth().subscribe();
      service.getProjectDistribution().subscribe();
      service.getProjectProgress().subscribe();
      service.getPublicationMetrics().subscribe();
      service.getPatentMetrics().subscribe();
      service.getResearchFunding().subscribe();
      service.getCommentActivity().subscribe();
      service.getSystemPerformance().subscribe();

      service.refreshAll();
      tick();

      const allRequests = httpMock.match(() => true);
      expect(allRequests.length).toBe(18);

      allRequests.forEach((req) => {
        requests.push(req.request.url);
        req.flush(mockData);
      });

      expect(requests).toContain(`${apiUrl}/systemOverview`);
      expect(requests).toContain(`${apiUrl}/userGrowth`);
      expect(requests).toContain(`${apiUrl}/projectDistribution`);
      expect(requests).toContain(`${apiUrl}/projectProgress`);
      expect(requests).toContain(`${apiUrl}/publicationMetrics`);
      expect(requests).toContain(`${apiUrl}/patentMetrics`);
      expect(requests).toContain(`${apiUrl}/researchFunding`);
      expect(requests).toContain(`${apiUrl}/commentActivity`);
      expect(requests).toContain(`${apiUrl}/systemPerformance`);
    }));
  });
});
