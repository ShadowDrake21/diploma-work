import { TestBed } from '@angular/core/testing';

import { PatentService } from './patent.service';

describe('PatentService', () => {
  let service: PatentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
