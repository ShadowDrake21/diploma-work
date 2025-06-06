import { Component, effect, inject, signal } from '@angular/core';
import { RecentUsersService } from '@core/services/users/recent-users.service';
import { isUserArray } from '@core/services/users/utils/type-guards.utils';

@Component({ template: '' })
export abstract class SharedRecentUsersBase {
  private readonly recentUsersService = inject(RecentUsersService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  private refreshInProgress = signal(false);

  constructor() {
    effect(() => {
      const result = this.recentUsersService.activeUsers();
      if (this.refreshInProgress()) {
        this.isLoading.set(false);
        this.refreshInProgress.set(false);
      }

      if (result && typeof result === 'object' && 'error' in result) {
        this.error.set(result.error.message || 'Failed to load active users');
      } else {
        this.error.set(null);
      }
    });
  }

  get activeUsers() {
    const result = this.recentUsersService.activeUsers();
    return isUserArray(result) ? result : [];
  }

  refreshActiveUsers() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.refreshInProgress.set(true);
    this.recentUsersService.refreshActiveUsers();
  }
}
