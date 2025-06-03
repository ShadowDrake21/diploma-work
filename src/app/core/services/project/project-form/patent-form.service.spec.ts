import { TestBed } from '@angular/core/testing';

import { PatentFormService } from './patent-form.service';

describe('PatentFormService', () => {
  let service: PatentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatentFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
