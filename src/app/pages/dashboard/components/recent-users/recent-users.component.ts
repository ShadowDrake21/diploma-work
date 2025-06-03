import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RecentUsersService } from '@core/services/users/recent-users.service';
import { UserRole } from '@shared/enums/user.enum';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

@Component({
  selector: 'sidebar-recent-users',
  imports: [CommonModule, MatIcon, TruncateTextPipe],
  templateUrl: './recent-users.component.html',
  styleUrl: './recent-users.component.scss',
})
export class RecentUsersComponent {
  private readonly recentUsersService = inject(RecentUsersService);

  get activeUsers() {
    return this.recentUsersService.activeUsers()?.data || [];
  }

  refreshActiveUsers() {
    this.recentUsersService.refreshActiveUsers();
  }
}
