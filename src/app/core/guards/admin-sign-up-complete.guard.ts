import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminSignUpCompleteGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const SIGNUP_COMPLETE_KEY = 'admin_signup_complete';

  return (
    !localStorage.getItem(SIGNUP_COMPLETE_KEY) ||
    router.createUrlTree(['/authentication/sign-in'])
  );
};
