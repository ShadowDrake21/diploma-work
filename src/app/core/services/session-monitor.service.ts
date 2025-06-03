import { inject, Injectable } from '@angular/core';
import { AuthService } from '@core/authentication/auth.service';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionMonitorService {
  private readonly authService = inject(AuthService);
  private checkInterval = 60 * 1000;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    timer(0, this.checkInterval).subscribe(() => {
      if (this.authService.isAuthenticated()) {
        this.authService.checkAndRefreshToken().subscribe();
      }
    });
  }
}
