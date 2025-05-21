import { TestBed } from '@angular/core/testing';

import { PublicationDataService } from './publication-data.service';

describe('PublicationDataService', () => {
  let service: PublicationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
