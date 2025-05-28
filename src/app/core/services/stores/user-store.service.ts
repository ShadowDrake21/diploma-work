import { inject, Injectable, signal } from '@angular/core';
import { UserService } from '../user.service';
import { map, of, tap } from 'rxjs';
import { currentUserSig } from '@core/shared/shared-signals';
import { AuthService } from '@core/authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  private readonly _isLoaded = signal(false);
  private readonly _rememberMe = signal(false);
  private readonly _isLoading = signal(false);

  public readonly isLoaded = this._isLoaded.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  // constructor() {
  //   this.initialize();
  // }

  // private initialize(): void {
  //   try {
  //     const storage = this.getStorage();
  //     const storedUser = storage.getItem('currentUser');
  //     if (storedUser) {
  //       const user = JSON.parse(storedUser);
  //       currentUserSig.set(user);
  //       this._isLoaded.set(true);
  //     } else if (this.authService.isAuthenticated()) {
  //       this.loadCurrentUser().subscribe({
  //         error: () => this.clearStorage(),
  //       });
  //     }
  //   } catch (error) {
  //     this.clearStorage();
  //   }
  // }

  public setRememberMe(remember: boolean): void {
    this._rememberMe.set(remember);
  }

  public loadCurrentUser() {
    if (this._isLoaded() || this._isLoading()) return of(currentUserSig());

    this._isLoading.set(true);
    return this.userService.getCurrentUser().pipe(
      tap((response) => {
        if (response.success) {
          currentUserSig.set(response.data);
          this.persistUser(response.data);
          this._isLoaded.set(true);
        }
        this._isLoading.set(false);
      }),
      map((response) => response.data)
    );
  }

  public clearUser(): void {
    currentUserSig.set(null);
    this._isLoaded.set(false);
    this.clearStorage();
  }

  private persistUser(user: any): void {
    const storage = this.getStorage();
    storage.setItem('currentUser', JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  private getStorage(): Storage {
    return this._rememberMe() ? localStorage : sessionStorage;
  }
}
