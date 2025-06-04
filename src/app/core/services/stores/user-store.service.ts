import { inject, Injectable, signal } from '@angular/core';
import { UserService } from '../users/user.service';
import { catchError, map, of, tap, throwError } from 'rxjs';
import { currentUserSig } from '@core/shared/shared-signals';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly _isLoaded = signal(false);
  private readonly _rememberMe = signal(false);
  private readonly _isLoading = signal(false);

  public readonly isLoaded = this._isLoaded.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  public setRememberMe(remember: boolean): void {
    this._rememberMe.set(remember);
    if (currentUserSig()) {
      this.persistUser(currentUserSig()!);
    }
  }

  public loadCurrentUser() {
    if (this._isLoaded()) return of(currentUserSig());

    if (this._isLoading()) {
      return throwError(() => new Error('User load already in progress'));
    }

    this._isLoading.set(true);

    return this.userService.getCurrentUser().pipe(
      tap({
        next: (response) => {
          console.log('UserStore: loadCurrentUser response:', response);
          currentUserSig.set(response!);
          this.persistUser(response);
          this._isLoaded.set(true);
        },
      }),
      catchError((error) => {
        this._isLoading.set(false);
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  public clearUser(): void {
    currentUserSig.set(null);
    this._isLoaded.set(false);
    this.clearStorage();
    this.notificationService.showInfo('You have been logged out.');
  }

  private persistUser(user: any): void {
    try {
      const storage = this.getStorage();
      storage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to persist user data:', error);
      this.notificationService.showError('Failed to save login session');
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Failed to clear user storage:', error);
    }
  }

  private getStorage(): Storage {
    return this._rememberMe() ? localStorage : sessionStorage;
  }

  private handleUserLoadError(error: any): void {
    console.error('User load error:', error);
    this.clearStorage();
    this._isLoaded.set(false);

    const errorMessage =
      error.status === 401
        ? 'Your session has expired. Please log in again.'
        : 'Failed to load user data. Please try again.';

    if (this.authService.isAuthenticated()) {
      this.authService.logout();
    }
  }
}
