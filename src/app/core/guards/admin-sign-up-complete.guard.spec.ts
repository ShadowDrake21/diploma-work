import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { adminSignUpCompleteGuard } from './admin-sign-up-complete.guard';

describe('adminSignUpCompleteGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => adminSignUpCompleteGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
