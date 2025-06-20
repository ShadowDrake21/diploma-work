import { TestBed } from '@angular/core/testing';

import { PublicationService } from './publication.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';
import { BASE_URL } from '@core/constants/default-variables';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { PaginatedResponse } from '@models/api-response.model';
import {
  CreatePublicationRequest,
  PublicationDTO,
  UpdatePublicationRequest,
} from '@models/publication.model';

describe('PublicationService', () => {
  let service: PublicationService;
  let httpMock: HttpTestingController;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  const baseUrl = `${BASE_URL}publications`;

  const mockPublication: PublicationDTO = {
    authors: [{ id: 1, username: 'Author One' }],
    id: '1',
    projectId: '1',
    publicationDate: new Date().toISOString(),
    publicationSource: 'Journal',
    doiIsbn: '10.1234/example.doi',
    startPage: 1,
    endPage: 10,
    journalVolume: 1,
    issueNumber: 2,
  };

  const mockPaginatedResponse: PaginatedResponse<PublicationDTO> = {
    data: [mockPublication],
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    page: 1,
    success: true,
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'handleServiceError',
    ]);
    TestBed.configureTestingModule({
      providers: [
        PublicationService,
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
      ],
    });
    service = TestBed.inject(PublicationService);
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

  describe('getAllPublications', () => {
    it('should return all publications without pagination', () => {
      service.getAllPublications().subscribe((publications) => {
        expect(publications).toEqual([mockPublication]);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockPublication]);
    });

    it('should return paginated publications', () => {
      service.getAllPublications(0, 10).subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });
  });

  describe('getPublicationById', () => {
    it('should return publication by id', () => {
      service.getPublicationById('1').subscribe((publication) => {
        expect(publication).toEqual(mockPublication);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPublication);
    });
  });

  describe('createPublication', () => {
    it('should create a new publication', () => {
      const createRequest: CreatePublicationRequest = {
        authors: [1],
        projectId: '1',
        publicationDate: new Date().toISOString(),
        publicationSource: 'Journal 1111',
        doiIsbn: '20.1234/example.doi',
        startPage: 10,
        endPage: 100,
        journalVolume: 1,
        issueNumber: 2,
      };

      service.createPublication(createRequest).subscribe((publication) => {
        expect(publication).toEqual(mockPublication);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockPublication);
    });
  });

  describe('updatePublication', () => {
    it('should update an existing publication', () => {
      const updateRequest: UpdatePublicationRequest = {
        authors: [2],
        id: '1',
        projectId: '1',
        publicationDate: new Date().toISOString(),
        publicationSource: 'Journal',
        doiIsbn: '20.1234/example.doi',
        startPage: 10,
        endPage: 100,
        journalVolume: 1,
        issueNumber: 2,
      };

      service.updatePublication('1', updateRequest).subscribe((publication) => {
        expect(publication).toEqual(mockPublication);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockPublication);
    });
  });

  describe('deletePublication', () => {
    it('should delete a publication', () => {
      service.deletePublication('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
