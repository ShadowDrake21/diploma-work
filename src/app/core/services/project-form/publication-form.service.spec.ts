import { TestBed } from '@angular/core/testing';

import { PublicationFormService } from './publication-form.service';

describe('PublicationFormService', () => {
  let service: PublicationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicationFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
