import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';

export const notAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
