import { TestBed } from '@angular/core/testing';

import { CreateWorkService } from './create-work.service';

describe('CreateWorkService', () => {
  let service: CreateWorkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateWorkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
