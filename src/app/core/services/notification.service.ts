import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

const DEFAULT_DURATION = 5000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  show(
    message: string,
    type: NotificationType = NotificationType.INFO,
    duration: number = DEFAULT_DURATION
  ): void {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: [`notification-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    };

    this.snackBar.open(message, this.translate.instant('common.close'), config);
  }

  showSuccess(message: string, duration: number = DEFAULT_DURATION): void {
    this.show(message, NotificationType.SUCCESS, duration);
  }

  showError(message: string, duration: number = DEFAULT_DURATION): void {
    this.show(message, NotificationType.ERROR, duration);
  }

  showWarning(message: string, duration: number = DEFAULT_DURATION): void {
    this.show(message, NotificationType.WARNING, duration);
  }

  showInfo(message: string, duration: number = DEFAULT_DURATION): void {
    this.show(message, NotificationType.INFO, duration);
  }

  showTranslated(
    key: string,
    params?: object,
    type: NotificationType = NotificationType.INFO,
    duration: number = DEFAULT_DURATION
  ): void {
    this.translate.get(key, params).subscribe((translated) => {
      this.show(translated, type, duration);
    });
  }
  showTranslatedSuccess(
    key: string,
    params?: object,
    duration: number = DEFAULT_DURATION
  ): void {
    this.showTranslated(key, params, NotificationType.SUCCESS, duration);
  }

  showTranslatedError(
    key: string,
    params?: object,
    duration: number = DEFAULT_DURATION
  ): void {
    this.showTranslated(key, params, NotificationType.ERROR, duration);
  }

  showTranslatedWarning(
    key: string,
    params?: object,
    duration: number = DEFAULT_DURATION
  ): void {
    this.showTranslated(key, params, NotificationType.WARNING, duration);
  }
}
