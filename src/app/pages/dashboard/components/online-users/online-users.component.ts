import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { RecentUsersService } from '@core/services/users/recent-users.service';

@Component({
  selector: 'dashboard-online-users',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    UserCardComponent,
  ],
  templateUrl: './online-users.component.html',
  styleUrl: './online-users.component.scss',
})
export class OnlineUsersComponent {
  private readonly recentUsersService = inject(RecentUsersService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  private refreshInProgress = signal(false);

  constructor() {
    // React to changes in the activeUsers signal
    effect(() => {
      const result = this.recentUsersService.activeUsers();
      if (this.refreshInProgress()) {
        this.isLoading.set(false);
        this.refreshInProgress.set(false);
      }

      if (result && 'error' in result) {
        this.error.set(result.error.message || 'Failed to load active users');
      } else {
        this.error.set(null);
      }
    });
  }

  get activeUsers() {
    const result = this.recentUsersService.activeUsers();
    return result && 'data' in result ? result.data : [];
  }

  refreshActiveUsers() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.refreshInProgress.set(true);
    this.recentUsersService.refreshActiveUsers();
  }
}
