import { TestBed } from '@angular/core/testing';

import { ResearchFormService } from './research-form.service';

describe('ResearchFormService', () => {
  let service: ResearchFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResearchFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
