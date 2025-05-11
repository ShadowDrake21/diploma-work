import { TestBed } from '@angular/core/testing';

import { ProjectDataCoreService } from './project-data-core.service';

describe('ProjectDataCoreService', () => {
  let service: ProjectDataCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectDataCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
