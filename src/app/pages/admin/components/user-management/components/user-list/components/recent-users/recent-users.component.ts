import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'admin-recent-users',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './recent-users.component.html',
  styleUrl: './recent-users.component.scss',
})
export class RecentUsersComponent {
  private readonly adminService = inject(AdminService);

  recentLogins = toSignal(this.adminService.getRecentLogins());
  loginStats = toSignal(this.adminService.getLoginStats());

  displayedColumns: string[] = [
    'username',
    'email',
    'loginTime',
    'ipAddress',
    'userAgent',
  ];
}
