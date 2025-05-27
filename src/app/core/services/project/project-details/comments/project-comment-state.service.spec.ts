import { TestBed } from '@angular/core/testing';

import { ProjectCommentStateService } from './project-comment-state.service';

describe('ProjectCommentStateService', () => {
  let service: ProjectCommentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectCommentStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
