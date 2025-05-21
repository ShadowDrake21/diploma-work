import { TestBed } from '@angular/core/testing';

import { ProjectFormCoreService } from './project-form-core.service';

describe('ProjectFormCoreService', () => {
  let service: ProjectFormCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectFormCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
