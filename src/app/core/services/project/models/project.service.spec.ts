import { TestBed } from '@angular/core/testing';

import { ProjectService } from './project.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { BASE_URL } from '@core/constants/default-variables';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';
import { PaginatedResponse } from '@models/api-response.model';
import {
  CreateProjectRequest,
  ProjectDTO,
  UpdateProjectRequest,
} from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { PublicationDTO } from '@models/publication.model';
import { PatentDTO } from '@models/patent.model';
import { UserRole } from '@shared/enums/user.enum';
import { ResearchDTO, ResearchStatuses } from '@models/research.model';
import { ProjectSearchFilters } from '@shared/types/search.types';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  const baseUrl = `${BASE_URL}projects`;

  const mockProject: ProjectDTO = {
    id: '1',
    title: 'Test Project',
    description: 'Test Description',
    type: ProjectType.RESEARCH,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tagIds: [],
    createdBy: 1,
    progress: 50,
  };

  const mockPaginatedResponse: PaginatedResponse<ProjectDTO> = {
    data: [mockProject],
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
      providers: [],
    });
    service = TestBed.inject(ProjectService);
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

  describe('getAllProjects', () => {
    it('should return all projects without pagination', () => {
      service.getAllProjects().subscribe((response) => {
        expect(response).toEqual([mockProject]);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockProject]);
    });

    it('should return paginated projects', () => {
      service.getAllProjects(0, 10).subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should handle error', () => {
      const errorMessage = 'Не вдалося завантажити проекти';
      service.getAllProjects().subscribe({
        error: (err) => {
          expect(errorHandler.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getProjectById', () => {
    it('should return project by id', () => {
      service.getProjectById('1').subscribe((response) => {
        expect(response).toEqual(mockProject);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProject);
    });
  });

  describe('getPublicationByProjectId', () => {
    it('should return publication for project', () => {
      const mockPublication: PublicationDTO = {
        authors: [{ id: 1, username: 'Author One' }],
        id: 'pub1',
        projectId: '1',
        publicationDate: new Date().toISOString(),
        publicationSource: 'Journal',
        doiIsbn: '10.1234/example.doi',
        startPage: 1,
        endPage: 10,
        journalVolume: 1,
        issueNumber: 2,
      };

      service.getPublicationByProjectId('1').subscribe((publication) => {
        expect(publication).toEqual(mockPublication);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/publication`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPublication);
    });
  });

  describe('getPatentByProjectId', () => {
    it('should return patent for project', () => {
      const mockPatent: PatentDTO = {
        id: 'pat1',
        projectId: '1',
        primaryAuthorId: 1,
        primaryAuthor: {
          id: 1,
          username: 'user',
          email: 'user@example.com',
          role: UserRole.USER,
          affiliation: 'university',
          publicationCount: 1,
          patentCount: 1,
          researchCount: 1,
          tags: [],
          active: true,
        },
        registrationNumber: '123456',
        registrationDate: new Date(),
        issuingAuthority: 'Patent Office',
        coInventors: [],
      };

      service.getPatentByProjectId('1').subscribe((patent) => {
        expect(patent).toEqual(mockPatent);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/patent`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatent);
    });
  });

  describe('getResearchByProjectId', () => {
    it('should return research for project', () => {
      const mockResearch: ResearchDTO = {
        participantIds: [1],
        id: 'res1',
        projectId: '1',
        budget: 100000,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: ResearchStatuses.IN_PROGRESS,
        fundingSource: 'Government Grant',
      };

      service.getResearchByProjectId('1').subscribe((research) => {
        expect(research).toEqual(mockResearch);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/research`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResearch);
    });
  });

  describe('createProject', () => {
    it('should create a new project', () => {
      const createRequest: CreateProjectRequest = {
        title: 'New Project',
        description: 'New Description',
        type: ProjectType.RESEARCH,
        progress: 50,
        tagIds: [],
        createdBy: 1,
      };

      service.createProject(createRequest).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush('1');
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', () => {
      const updateRequest: UpdateProjectRequest = {
        title: 'Updated Project',
        description: 'Updated Description',
      };

      service.updateProject('1', updateRequest).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush('1');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', () => {
      service.deleteProject('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('searchProjects', () => {
    it('should search projects with filters', () => {
      const filters: ProjectSearchFilters = {
        search: 'test',
        types: [ProjectType.RESEARCH],
        tags: ['tag1', 'tag2'],
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      service.searchProjects(filters, 0, 10).subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search?page=0&size=10&search=test&types=RESEARCH&tags=tag1,tag2&startDate=2023-01-01&endDate=2023-12-31`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });
  });

  describe('getNewestProjects', () => {
    it('should get newest projects', () => {
      service.getNewestProjects(5).subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/newest?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });
  });

  describe('getMyProjects', () => {
    it('should get projects for current user', () => {
      const filters: ProjectSearchFilters = {
        search: 'my',
      };

      service.getMyProjects(filters, 0, 10).subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/mine?page=0&size=10&search=my`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });
  });
});
