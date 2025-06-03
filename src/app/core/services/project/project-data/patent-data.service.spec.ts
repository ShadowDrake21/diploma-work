import { TestBed } from '@angular/core/testing';

import { PatentDataService } from './patent-data.service';

describe('PatentDataService', () => {
  let service: PatentDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatentDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
