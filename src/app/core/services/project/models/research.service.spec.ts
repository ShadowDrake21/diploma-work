import { TestBed } from '@angular/core/testing';

import { ResearchService } from './research.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';
import {
  CreateResearchRequest,
  ResearchDTO,
  ResearchStatuses,
  UpdateResearchRequest,
} from '@models/research.model';
import { BASE_URL } from '@core/constants/default-variables';
import { PaginatedResponse } from '@models/api-response.model';

describe('ResearchService', () => {
  let service: ResearchService;
  let httpMock: HttpTestingController;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

  const baseUrl = `${BASE_URL}researches`;

  const mockResearch: ResearchDTO = {
    id: '1',
    participantIds: [1, 2],
    projectId: '1',
    budget: 10000,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: ResearchStatuses.PROPOSED,
    fundingSource: 'Government grant',
  };

  beforeEach(() => {
    const errorHandlerSpyObj = jasmine.createSpyObj('ErrorHandlerService', [
      'handleServiceError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ResearchService,
        { provide: ErrorHandlerService, useValue: errorHandlerSpyObj },
      ],
    });

    service = TestBed.inject(ResearchService);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandlerSpy = TestBed.inject(
      ErrorHandlerService
    ) as jasmine.SpyObj<ErrorHandlerService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all researches without pagination', () => {
      const mockResearches: ResearchDTO[] = [mockResearch];

      service.getAll().subscribe((researches) => {
        expect(researches).toEqual(mockResearches);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResearches);
    });

    it('should return paginated researches', () => {
      const mockPaginatedResponse: PaginatedResponse<ResearchDTO> = {
        page: 1,
        totalPages: 1,
        totalItems: 1,
        hasNext: false,
        success: true,
        timestamp: new Date().toISOString(),
        data: [mockResearch],
      };

      service.getAll(0, 10).subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should handle error', () => {
      service.getAll().subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getById', () => {
    it('should return research by id', () => {
      service.getById('1').subscribe((research) => {
        expect(research).toEqual(mockResearch);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResearch);
    });

    it('should handle error', () => {
      service.getById('1').subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('create', () => {
    it('should create new research', () => {
      const createRequest: CreateResearchRequest = {
        participantIds: ['1', '2'],
        projectId: '1',
        budget: 10000,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: ResearchStatuses.PROPOSED,
        fundingSource: 'Government grant',
      };

      service.create(createRequest).subscribe((research) => {
        expect(research).toEqual(mockResearch);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResearch);
    });

    it('should handle error', () => {
      const createRequest: CreateResearchRequest = {
        participantIds: ['1', '2'],
        projectId: '1',
        budget: 10000,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: ResearchStatuses.PROPOSED,
        fundingSource: 'Government grant',
      };

      service.create(createRequest).subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('update', () => {
    it('should update research', () => {
      const updateRequest: UpdateResearchRequest = {
        id: '1',
        participantIds: ['3', '4', '5'],
        projectId: '1',
        budget: 10000,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: ResearchStatuses.COMPLETED,
        fundingSource: 'Government grant',
      };

      service.update('1', updateRequest).subscribe((research) => {
        expect(research).toEqual(mockResearch);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResearch);
    });

    it('should handle error', () => {
      const updateRequest: UpdateResearchRequest = {
        id: '1',
        participantIds: ['3', '4', '5'],
        projectId: '1',
        budget: 10000,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: ResearchStatuses.COMPLETED,
        fundingSource: 'Government grant',
      };

      service.update('1', updateRequest).subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('delete', () => {
    it('should delete research', () => {
      service.delete('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error', () => {
      service.delete('1').subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.error(new ProgressEvent('error'));
    });
  });
});
