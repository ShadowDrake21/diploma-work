import { TestBed } from '@angular/core/testing';

import { ResearchDataService } from './research-data.service';

describe('ResearchDataService', () => {
  let service: ResearchDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResearchDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
