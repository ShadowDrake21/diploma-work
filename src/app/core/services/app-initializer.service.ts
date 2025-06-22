import { inject, Injectable, OnDestroy } from '@angular/core';
import { AuthService } from '@core/authentication/auth.service';
import { UserStore } from './stores/user-store.service';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService implements OnDestroy {
  private authService = inject(AuthService);
  private userStore = inject(UserStore);
  private destroy$ = new Subject<void>();

  initialize(): Promise<void> {
    return new Promise((resolve) => {
      if (this.authService.isAuthenticated()) {
        this.authService
          .checkAndRefreshToken()
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.userStore.initializeCurrentUser();
            resolve();
          });
      } else {
        resolve();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
