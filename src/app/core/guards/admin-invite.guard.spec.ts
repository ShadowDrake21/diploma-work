import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { adminInviteGuard } from './admin-invite.guard';

describe('adminInviteGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => adminInviteGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
