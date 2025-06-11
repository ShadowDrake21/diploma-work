import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { ApiError } from '@models/error.model';
import { catchError, map, Observable, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        return handleSuccessResponse(event);
      }
      return event;
    }),
    catchError((error) => handleError(error))
  );

  function handleSuccessResponse(
    response: HttpResponse<any>
  ): HttpResponse<any> {
    const body = response.body;

    if (isPaginatedResponse(body)) {
      return response;
    }

    if (isApiResponse(body)) {
      if (body.success) {
        return response.clone({ body: body.data });
      } else {
        throw new HttpErrorResponse({
          status: response.status,
          error: body,
          url: response.url || undefined,
        });
      }
    }

    return response;
  }

  function handleError(error: HttpErrorResponse): Observable<never> {
    const errorResponse = error.error || error.message;

    if (isApiResponse(errorResponse) && !isPaginatedResponse(errorResponse)) {
      const apiError: ApiError = {
        message: errorResponse.message || 'Запит не виконано',
        errorCode: errorResponse.errorCode || 'UNKNOWN_ERROR',
        status: error.status,
        timestamp: errorResponse.timestamp,
      };
      console.error('API Error:', apiError);
      return throwError(() => apiError);
    }

    return throwError(() => ({
      message: error.message || 'Помилка мережі',
      code: 'NETWORK_ERROR',
      status: error.status,
    }));
  }

  function isApiResponse(obj: any): obj is ApiResponse<any> {
    return obj && typeof obj === 'object' && 'success' in obj && 'data' in obj;
  }

  function isPaginatedResponse(obj: any): obj is PaginatedResponse<any> {
    return isApiResponse(obj) && 'page' in obj && 'totalItems' in obj;
  }
};
