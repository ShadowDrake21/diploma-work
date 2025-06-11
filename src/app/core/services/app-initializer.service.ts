import { inject, Injectable } from '@angular/core';
import { AuthService } from '@core/authentication/auth.service';
import { UserStore } from './stores/user-store.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  private authService = inject(AuthService);
  private userStore = inject(UserStore);

  initialize(): Promise<void> {
    return new Promise((resolve) => {
      if (this.authService.isAuthenticated()) {
        this.authService.checkAndRefreshToken().subscribe(() => {
          this.userStore.initializeCurrentUser();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
