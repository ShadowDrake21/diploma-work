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
  const refreshThreshold = 15 * 60 * 1000; // 15 minutes

  if (timeLeft < refreshThreshold && timeLeft > 0) {
    authService.sessionWarningSubject.next(timeLeft);
  }

  const authReq = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handleUnauthorizedError(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
}
function handleUnauthorizedError(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  // First check if we should show session warning
  const token = authService.getToken();
  if (token) {
    const decoded = authService.decodeToken(token);
    if (decoded) {
      const timeLeft = authService.getTokenTimeLeft(decoded);
      if (timeLeft > 0) {
        authService.sessionWarningSubject.next(timeLeft);
        return throwError(() => new Error('Session about to expire'));
      }
    }
  }

  // If no time left or no token, proceed with refresh
  if (!authService.isRefreshingToken) {
    authService.isRefreshingToken = true;

    return authService.refreshToken().pipe(
      switchMap((newToken) => {
        authService.isRefreshingToken = false;

        if (newToken) {
          const newRequest = request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(newRequest);
        } else {
          authService.clearAuthData();
          router.navigate(['/authentication/sign-in']);
          return throwError(() => new Error('Session expired'));
        }
      }),
      catchError((error) => {
        authService.isRefreshingToken = false;
        authService.clearAuthData();
        router.navigate(['/authentication/sign-in']);
        return throwError(() => error);
      })
    );
  } else {
    // Wait for refresh to complete
    return authService.tokenRefreshed$.pipe(
      switchMap((newToken) => {
        if (newToken) {
          const newRequest = request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(newRequest);
        } else {
          authService.clearAuthData();
          router.navigate(['/authentication/sign-in']);
          return throwError(() => new Error('Session expired'));
        }
      })
    );
  }
}
