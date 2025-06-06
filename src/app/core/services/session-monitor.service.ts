import { inject, Injectable, OnDestroy } from '@angular/core';
import { AuthService } from '@core/authentication/auth.service';
import { catchError, of, Subscription, timer } from 'rxjs';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SessionMonitorService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private checkInterval = 60 * 1000;
  private timerSubscription!: Subscription;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    this.timerSubscription = timer(0, this.checkInterval).subscribe(() => {
      if (this.authService.isAuthenticated()) {
        this.authService.checkAndRefreshToken().subscribe({
          next: (token) => {
            if (!token) {
              this.authService.logout();
              this.router.navigate(['/authentication/sign-in']);
            }
          },
          error: (error) => {
            console.error('Token check failed:', error);
            this.authService.logout();
            this.router.navigate(['/authentication/sign-in']);
          },
        });
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
