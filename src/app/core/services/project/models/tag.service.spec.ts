import { TestBed } from '@angular/core/testing';

import { TagService } from './tag.service';
import { ResearchDTO } from '@models/research.model';
import { HttpTestingController } from '@angular/common/http/testing';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';
import { ResearchService } from './research.service';
import { Tag, TagDTO } from '@models/tag.model';
import { BASE_URL } from '@core/constants/default-variables';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

  const mockTag: Tag = {
    id: '1',
    name: 'Test Tag',
  };

  const baseUrl = `${BASE_URL}tags`;

  beforeEach(() => {
    const errorHandlerSpyObj = jasmine.createSpyObj('ErrorHandlerService', [
      'handleServiceError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TagService,
        { provide: ErrorHandlerService, useValue: errorHandlerSpyObj },
      ],
    });

    service = TestBed.inject(TagService);
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

  describe('getAllTags', () => {
    it('should return all tags', () => {
      const mockTags: Tag[] = [mockTag];

      service.getAllTags().subscribe((tags) => {
        expect(tags).toEqual(mockTags);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTags);
    });

    it('should handle error', () => {
      service.getAllTags().subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getTagById', () => {
    it('should return tag by id', () => {
      service.getTagById('1').subscribe((tag) => {
        expect(tag).toEqual(mockTag);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTag);
    });

    it('should handle error', () => {
      service.getTagById('1').subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('createTag', () => {
    it('should create new tag', () => {
      const createRequest: TagDTO = {
        name: 'New Tag',
      };

      service.createTag(createRequest).subscribe((tag) => {
        expect(tag).toEqual(mockTag);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockTag);
    });

    it('should handle error', () => {
      const createRequest: TagDTO = {
        name: 'New Tag',
      };

      service.createTag(createRequest).subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('updateTag', () => {
    it('should update tag', () => {
      const updateRequest: TagDTO = {
        name: 'Updated Tag',
      };

      service.updateTag('1', updateRequest).subscribe((tag) => {
        expect(tag).toEqual(mockTag);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockTag);
    });

    it('should handle error', () => {
      const updateRequest: TagDTO = {
        name: 'Updated Tag',
      };

      service.updateTag('1', updateRequest).subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('deleteTag', () => {
    it('should delete tag', () => {
      service.deleteTag('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error', () => {
      service.deleteTag('1').subscribe({
        error: () => {
          expect(errorHandlerSpy.handleServiceError).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.error(new ProgressEvent('error'));
    });
  });
});
