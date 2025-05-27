import { TestBed } from '@angular/core/testing';

import { ProjectTagService } from './project-tag.service';

describe('ProjectTagService', () => {
  let service: ProjectTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
