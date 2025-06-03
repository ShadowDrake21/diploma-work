import { inject, Injectable, OnDestroy } from '@angular/core';
import { AuthService } from '@core/authentication/auth.service';
import { catchError, of, Subscription, timer } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class SessionMonitorService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private checkInterval = 60 * 1000;
  private timerSubscription!: Subscription;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    this.timerSubscription = timer(0, this.checkInterval).subscribe(() => {
      if (this.authService.isAuthenticated()) {
        this.authService
          .checkAndRefreshToken()
          .pipe(
            catchError((error) => {
              console.error('Session check error:', error);
              this.notificationService.showError('Session maintenance failed');
              return of(null);
            })
          )
          .subscribe();
      }
    });
  }

  setCheckInterval(intervalMs: number): void {
    this.checkInterval = intervalMs;
    this.restartMonitoring();
  }

  private restartMonitoring(): void {
    this.stopMonitoring();
    this.startMonitoring();
  }

  private stopMonitoring(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
