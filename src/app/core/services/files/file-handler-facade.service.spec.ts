import { TestBed } from '@angular/core/testing';

import { FileHandlerFacadeService } from './file-handler-facade.service';

describe('FileHandlerFacadeService', () => {
  let service: FileHandlerFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileHandlerFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
