import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { apiInterceptor } from './api.interceptor';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { ApiError } from '@models/error.model';

describe('ApiInterceptor', () => {
  let httpRequestSpy: jasmine.SpyObj<HttpRequest<any>>;
  let httpHandlerSpy: jasmine.SpyObj<{ handle: HttpHandlerFn }>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpRequestSpy = jasmine.createSpyObj('HttpRequest', ['clone']);
    httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);
  });

  it('should be created', () => {
    expect(apiInterceptor).toBeTruthy();
  });

  describe('successfull responses', () => {
    it('should pass through non-API responses unchanged', (done) => {
      const mockResponse = new HttpResponse({
        body: { some: 'data' },
        status: 200,
      });

      httpHandlerSpy.handle.and.returnValue(of(mockResponse));

      apiInterceptor(httpRequestSpy, httpHandlerSpy.handle).subscribe({
        next: (event) => {
          expect(event).toBe(mockResponse);
          done();
        },
      });
    });

    it('should unwrap successful API responses', (done) => {
      const apiResponse: ApiResponse<string> = {
        success: true,
        data: 'test data',
        message: 'Success',
        timestamp: new Date().toISOString(),
      };

      const mockResponse = new HttpResponse({
        body: apiResponse,
        status: 200,
      });

      httpHandlerSpy.handle.and.returnValue(of(mockResponse));

      apiInterceptor(httpRequestSpy, httpHandlerSpy.handle).subscribe({
        next: (event) => {
          expect(event).toBeInstanceOf(HttpResponse);
          expect((event as HttpResponse<any>).body).toBe('test data');
          done();
        },
      });
    });

    it('should pass through paginated responses unchanged', (done) => {
      const paginatedResponse: PaginatedResponse<string> = {
        success: true,
        data: ['item1', 'item2'],
        message: 'Success',
        page: 1,
        totalItems: 2,
        totalPages: 1,
        timestamp: new Date().toISOString(),
        hasNext: false,
      };
      const mockResponse = new HttpResponse({
        body: paginatedResponse,
        status: 200,
      });

      httpHandlerSpy.handle.and.returnValue(of(mockResponse));

      apiInterceptor(httpRequestSpy, httpHandlerSpy.handle).subscribe({
        next: (event) => {
          expect(event).toBe(mockResponse);
          done();
        },
      });
    });
  });

  describe('error responses', () => {
    it('should transform API error responses', (done) => {
      const apiErrorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      };

      const errorResponse = new HttpErrorResponse({
        error: apiErrorResponse,
        status: 400,
        url: 'http://test.com/api',
      });

      httpHandlerSpy.handle.and.returnValue(throwError(() => errorResponse));

      apiInterceptor(httpRequestSpy, httpHandlerSpy.handle).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe('Validation failed');
          expect(error.errorCode).toBe('VALIDATION_ERROR');
          expect(error.status).toBe(400);
          done();
        },
      });
    });

    it('should handle non-API error responses', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'Network error',
        status: 0,
        url: 'http://test.com/api',
      });

      httpHandlerSpy.handle.and.returnValue(throwError(() => errorResponse));

      apiInterceptor(httpRequestSpy, httpHandlerSpy.handle).subscribe({
        error: (error) => {
          expect(error.message).toBe('Помилка мережі');
          expect(error.code).toBe('NETWORK_ERROR');
          done();
        },
      });
    });

    it('should handle empty error responses', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: null,
        status: 500,
      });

      httpHandlerSpy.handle.and.returnValue(throwError(() => errorResponse));

      apiInterceptor(httpRequestSpy, httpHandlerSpy.handle).subscribe({
        error: (error) => {
          expect(error.message).toBe('Помилка мережі');
          expect(error.code).toBe('NETWORK_ERROR');
          done();
        },
      });
    });
  });

  function of<T>(value: T): Observable<T> {
    return new Observable((subscriber) => {
      subscriber.next(value);
      subscriber.complete();
    });
  }

  function throwError(error: any): Observable<never> {
    return new Observable((subscriber) => {
      subscriber.error(error);
    });
  }
});
