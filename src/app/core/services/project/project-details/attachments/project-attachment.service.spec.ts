import { TestBed } from '@angular/core/testing';

import { ProjectAttachmentService } from './project-attachment.service';

describe('ProjectAttachmentService', () => {
  let service: ProjectAttachmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectAttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
