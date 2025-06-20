import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ProjectTagService } from './project-tag.service';
import { Tag } from '@models/tag.model';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';
import { TagService } from '../../models/tag.service';
import { of, throwError } from 'rxjs';

describe('ProjectTagService', () => {
  let service: ProjectTagService;

  let tagServiceSpy: jasmine.SpyObj<TagService>;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

  const mockTag1: Tag = { id: '1', name: 'Tag 1' };
  const mockTag2: Tag = { id: '2', name: 'Tag 2' };

  beforeEach(() => {
    tagServiceSpy = jasmine.createSpyObj('TagService', ['getTagById']);
    errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'handleServiceError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectTagService,
        { provide: TagService, useValue: tagServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
      ],
    });

    service = TestBed.inject(ProjectTagService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty tags', (done) => {
    service.tags$.subscribe((tags) => {
      expect(tags).toEqual([]);
      done();
    });
  });

  it('should handle empty tagIds array', () => {
    service.loadTags([]);
    expect(tagServiceSpy.getTagById).not.toHaveBeenCalled();
    service.tags$.subscribe((tags) => {
      expect(tags).toEqual([]);
    });
  });

  it('should load tags successfully', fakeAsync(() => {
    tagServiceSpy.getTagById.withArgs('1').and.returnValue(of(mockTag1));
    tagServiceSpy.getTagById.withArgs('2').and.returnValue(of(mockTag2));

    service.loadTags(['1', '2']);
    tick();

    service.tags$.subscribe((tags) => {
      expect(tags).toEqual([mockTag1, mockTag2]);
      expect(errorHandlerSpy.handleServiceError).not.toHaveBeenCalled();
    });
  }));

  it('should handle partial tag loading failure', fakeAsync(() => {
    tagServiceSpy.getTagById.withArgs('1').and.returnValue(of(mockTag1));
    tagServiceSpy.getTagById
      .withArgs('2')
      .and.returnValue(throwError(() => new Error('Not found')));

    service.loadTags(['1', '2']);
    tick();

    service.tags$.subscribe((tags) => {
      expect(tags).toEqual([mockTag1]);
      expect(errorHandlerSpy.handleServiceError).toHaveBeenCalledWith(
        jasmine.any(Error),
        '1 теги не вдалося завантажити'
      );
    });
  }));

  it('should handle complete tag loading failure', fakeAsync(() => {
    tagServiceSpy.getTagById.and.returnValue(
      throwError(() => new Error('Not found'))
    );

    service.loadTags(['1', '2']);
    tick();

    service.tags$.subscribe((tags) => {
      expect(tags).toEqual([]);
      expect(errorHandlerSpy.handleServiceError).toHaveBeenCalledWith(
        jasmine.any(Error),
        'Не вдалося завантажити теги'
      );
    });
  }));

  it('should reset tags', () => {
    tagServiceSpy.getTagById.and.returnValue(of(mockTag1));
    service.loadTags(['1']);

    service.resetTags();

    service.tags$.subscribe((tags) => {
      expect(tags).toEqual([]);
    });
  });

  it('should complete destroyed$ on ngOnDestroy', () => {
    const destroyedSpy = spyOn(service['destroyed$'], 'next');
    const completeSpy = spyOn(service['destroyed$'], 'complete');

    service.ngOnDestroy();

    expect(destroyedSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
