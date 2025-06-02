import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecentUsersService } from '@core/services/users/recent-users.service';
import { UserRole } from '@shared/enums/user.enum';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

@Component({
  selector: 'sidebar-recent-users',
  imports: [CommonModule, MatIcon, TruncateTextPipe, MatProgressSpinnerModule],
  templateUrl: './recent-users.component.html',
  styleUrl: './recent-users.component.scss',
})
export class RecentUsersComponent {
  private readonly recentUsersService = inject(RecentUsersService);

  isLoading = signal(false);
  error = signal<string | null>(null);

  get activeUsers() {
    return this.recentUsersService.activeUsers()?.data || [];
  }

  refreshActiveUsers() {
    this.isLoading.set(true);
    this.error.set(null);
    this.recentUsersService.refreshActiveUsers();
    setTimeout(() => this.isLoading.set(false), 1000);
  }
}
