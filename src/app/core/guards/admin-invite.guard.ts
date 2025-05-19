import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from '@core/services/admin.service';
import { catchError, map, of } from 'rxjs';

export const adminInviteGuard: CanActivateFn = (route, state) => {
  const adminService = inject(AdminService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const token = route.queryParamMap.get('token');
  const email = route.queryParamMap.get('email');

  if (!token || !email) {
    snackBar.open('Invalid invitation link', 'Close', {
      duration: 3000,
    });
    return router.createUrlTree(['/authentication/sign-in']);
  }

  return adminService.validateAdminInviteToken(token, email).pipe(
    map(
      (isValid) => isValid || router.createUrlTree(['/authentication/sign-in']),
      catchError(() => {
        snackBar.open('Error validating invitation link', 'Close', {
          duration: 3000,
        });
        return of(router.createUrlTree(['/authentication/sign-in']));
      })
    )
  );
};
