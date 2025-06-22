import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { UserService } from '../users/user.service';
import { catchError, of, tap } from 'rxjs';
import { currentUserSig } from '@core/shared/shared-signals';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '../notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _isLoading = signal(false);
  public readonly isLoading = this._isLoading.asReadonly();

  public readonly currentUser = this.authService.currentUser$;

  constructor() {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user) {
          this.loadCurrentUser()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        } else {
          currentUserSig.set(null);
        }
      });
  }

  public initializeCurrentUser() {
    if (this.authService.isAuthenticated() && !currentUserSig()) {
      this.loadCurrentUser()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  public loadCurrentUser() {
    if (this._isLoading()) return of(null);

    if (!this.authService.isAuthenticated()) return of(null);

    this._isLoading.set(true);

    return this.userService.getCurrentUser().pipe(
      tap((user) => {
        const jwtUser = this.authService.getCurrentUser();
        currentUserSig.set({ ...user, ...jwtUser });
      }),
      catchError(() => of(null)),
      tap(() => this._isLoading.set(false))
    );
  }

  public clearUser(): void {
    currentUserSig.set(null);
    this.authService.logout();
    this.notificationService.showInfo('Ви вийшли з системи.');
  }
}
