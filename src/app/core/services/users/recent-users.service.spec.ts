import { TestBed } from '@angular/core/testing';

import { RecentUsersService } from './recent-users.service';

describe('RecentUsersService', () => {
  let service: RecentUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
