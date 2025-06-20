import { TestBed } from '@angular/core/testing';

import { PatentService } from './patent.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';
import {
  CreatePatentRequest,
  PatentCoInventorDTO,
  PatentDTO,
  UpdatePatentRequest,
} from '@models/patent.model';
import { UserRole } from '@shared/enums/user.enum';
import { BASE_URL } from '@core/constants/default-variables';
import { PaginatedResponse } from '@models/api-response.model';

describe('PatentService', () => {
  let service: PatentService;
  let httpMock: HttpTestingController;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  const mockPrimaryAuthor = {
    id: 1,
    username: 'Primary Author',
    email: '',
    role: UserRole.USER,
    affiliation: 'Test Affiliation',
    publicationCount: 0,
    patentCount: 0,
    researchCount: 0,
    active: true,
    tags: [],
  };

  const mockPatent: PatentDTO = {
    id: '1',
    projectId: 'project-1',
    primaryAuthorId: 1,
    registrationNumber: '12345',
    registrationDate: new Date(),
    issuingAuthority: 'Test Authority',
    coInventors: [],
    primaryAuthor: mockPrimaryAuthor,
  };

  const mockCoInventors: PatentCoInventorDTO[] = [
    { id: 1, userId: 1, userName: 'Inventor 1' },
    { id: 2, userId: 2, userName: 'Inventor 2' },
  ];

  beforeEach(() => {
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'handleServiceError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PatentService,
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
      ],
    });

    service = TestBed.inject(PatentService);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandler = TestBed.inject(
      ErrorHandlerService
    ) as jasmine.SpyObj<ErrorHandlerService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPatents', () => {
    it('should get all patents without pagination', () => {
      const mockPatents: PatentDTO[] = [mockPatent];
      service.getAllPatents().subscribe((patents) => {
        expect(patents).toEqual(mockPatents);
      });
      const req = httpMock.expectOne(`${BASE_URL}patents`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatents);
    });

    it('should get paginated patents', () => {
      const mockResponse: PaginatedResponse<PatentDTO> = {
        data: [mockPatent],
        totalItems: 1,
        page: 1,
        success: true,
        totalPages: 1,
        hasNext: false,
        timestamp: new Date().toISOString(),
      };

      service.getAllPatents(1, 10).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${BASE_URL}patents?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle erorr for getAllPatents', () => {
      service.getAllPatents().subscribe({
        error: (err) => {
          expect(errorHandler.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}patents`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getPatentById', () => {
    it('should get patent by id', () => {
      service.getPatentById('1').subscribe((patent) => {
        expect(patent).toEqual(mockPatent);
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatent);
    });

    it('should handle error for getPatentById', () => {
      service.getPatentById('1').subscribe({
        error: (err) => {
          expect(errorHandler.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getPatentCoInventors', () => {
    it('should get co-inventors for patent', () => {
      service.getPatentCoInventors('1').subscribe((inventors) => {
        expect(inventors).toEqual(mockCoInventors);
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1/co-inventors`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCoInventors);
    });

    it('should handle error for getPatentCoInventors', () => {
      service.getPatentCoInventors('1').subscribe({
        error: (err) => {
          expect(errorHandler.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1/co-inventors`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('createPatent', () => {
    it('should create a new patent', () => {
      const createRequest: CreatePatentRequest = {
        projectId: 'project-1',
        primaryAuthorId: 1,
        registrationNumber: '12345',
        registrationDate: new Date().toISOString(),
        issuingAuthority: 'Test Authority',
        coInventors: [],
      };

      service.createPatent(createRequest).subscribe((patent) => {
        expect(patent).toEqual(mockPatent);
      });

      const req = httpMock.expectOne(`${BASE_URL}patents`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockPatent);
    });

    it('should handle error for createPatent', () => {
      const createRequest: CreatePatentRequest = {
        projectId: 'project-1',
        primaryAuthorId: 1,
        registrationNumber: '12345',
        registrationDate: new Date().toISOString(),
        issuingAuthority: 'Test Authority',
        coInventors: [],
      };

      service.createPatent(createRequest).subscribe({
        error: (err) => {
          expect(errorHandler.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}patents`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('updatePatent', () => {
    it('should update an existing patent', () => {
      const updateRequest: UpdatePatentRequest = {
        id: '1',
        projectId: 'project-1',
        primaryAuthorId: 1,
        registrationNumber: '12345',
        registrationDate: new Date().toISOString(),
        issuingAuthority: 'Test Authority',
        coInventors: [],
      };

      service.updatePatent('1', updateRequest).subscribe((patent) => {
        expect(patent).toEqual(mockPatent);
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockPatent);
    });

    it('should handle error for updatePatent', () => {
      const updateRequest: UpdatePatentRequest = {
        id: '1',
        projectId: 'project-1',
        primaryAuthorId: 1,
        registrationNumber: '12345',
        registrationDate: new Date().toISOString(),
        issuingAuthority: 'Test Authority',
        coInventors: [],
      };

      service.updatePatent('1', updateRequest).subscribe({
        error: (err) => {
          expect(errorHandler.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('deletePatent', () => {
    it('should delete a patent', () => {
      service.deletePatent('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error for deletePatent', () => {
      service.deletePatent('1').subscribe({
        error: (err) => {
          expect(errorHandler.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}patents/1`);
      req.error(new ProgressEvent('error'));
    });
  });
});
