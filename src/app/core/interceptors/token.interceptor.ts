import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { catchError, Observable, throwError } from 'rxjs';

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
    return throwError(() => new Error('Токен не знайдено'));
  }

  const decoded = authService.decodeToken(token);
  if (!decoded || authService.isTokenExpired(decoded)) {
    authService.clearAuthData();
    return throwError(() => new Error('Недійсний або прострочений токен'));
  }

  const timeLeft = authService.getTokenTimeLeft(decoded);
  const refreshThreshold = 5 * 60 * 1000;

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
