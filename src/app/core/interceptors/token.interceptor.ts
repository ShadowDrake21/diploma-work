import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

export function tokenInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (request.url.includes('/api/auth')) {
    return next(request);
  }

  const token = authService.getToken();
  if (!token) {
    authService.clearAuthData();
    return throwError(() => new Error('No token found'));
  }

  const decoded = authService.decodeToken(token);
  if (!decoded || authService.isTokenExpired(decoded)) {
    authService.clearAuthData();
    return throwError(() => new Error('Invalid or expired token'));
  }

  const timeLeft = authService.getTokenTimeLeft(decoded);
  const refreshThreshold = 5 * 60 * 1000; // 15 minutes

  if (timeLeft < refreshThreshold && timeLeft > 0) {
    authService.showSessionWarning(timeLeft);
  }

  const authReq = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/authentication/sign-in']);
      }
      return throwError(() => error);
    })
  );
}
