import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../notification.service';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private notificationService = inject(NotificationService);

  handleServiceError(
    error: any,
    defaultMessage: string = 'An error occurred'
  ): Observable<never> {
    const message = error.message || error.error?.message || defaultMessage;
    this.notificationService.showError(message);
    console.error('Service error:', error);
    return throwError(() => error);
  }

  handleNotFoundError(entity: string = 'Item'): Observable<never> {
    return this.handleServiceError(
      { message: `${entity} not found` },
      `${entity} not found`
    );
  }

  handleUnauthorizedError = (): Observable<never> => {
    return this.handleServiceError(
      { message: 'You are not authorized to perform this action' },
      'Authorization required'
    );
  };
}
