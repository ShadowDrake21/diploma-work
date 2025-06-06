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

  if (!authService.checkTokenStatus()) {
    return throwError(() => new Error('Invalid session'));
  }

  const token = authService.getToken();
  const authReq = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handleUnauthorizedError(authReq, next, authService, router);
      } else if (error.status === 419) {
        router.navigate(['/forbidden']);
        return throwError(
          () => new Error('Forbidden: Insufficient permissions')
        );
      }
      return throwError(() => error);
    })
  );

  function addTokenToRequest(
    request: HttpRequest<unknown>,
    token: string
  ): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  function handleUnauthorizedError(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService,
    router: Router
  ): Observable<HttpEvent<unknown>> {
    if (!authService.isRefreshingToken) {
      authService.isRefreshingToken = true;

      return authService.refreshToken().pipe(
        switchMap((newToken) => {
          authService.isRefreshingToken = false;

          if (newToken) {
            const newRequest = addTokenToRequest(request, newToken);
            return next(newRequest);
          } else {
            authService.logout();
            router.navigate(['/authentication/sign-in']);
            return throwError(() => new Error('Session expired'));
          }
        }),
        catchError((refreshError) => {
          authService.isRefreshingToken = false;
          authService.logout();
          router.navigate(['/authentication/sign-in']);
          return throwError(() => refreshError);
        })
      );
    } else {
      return authService.tokenRefreshed$.pipe(
        switchMap((newToken) => {
          if (newToken) {
            const newRequest = addTokenToRequest(request, newToken);
            return next(newRequest);
          } else {
            authService.logout();
            router.navigate(['/authentication/sign-in']);
            return throwError(() => new Error('Session expired'));
          }
        })
      );
    }
  }
}
