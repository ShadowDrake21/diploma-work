import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';

import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'admin-recent-users',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent,
  ],
  templateUrl: './recent-users.component.html',
})
export class RecentUsersComponent {
  private readonly adminService = inject(AdminService);

  recentLogins = toSignal(this.adminService.getRecentLogins(), {
    initialValue: null,
  });
  loginStats = toSignal(this.adminService.getLoginStats(), {
    initialValue: null,
  });

  error = this.adminService.error;
  displayedColumns: string[] = [
    'username',
    'email',
    'loginTime',
    'ipAddress',
    'userAgent',
  ];

  retryLoadData() {
    this.adminService.resetState();

    this.recentLogins = toSignal(this.adminService.getRecentLogins(), {
      initialValue: null,
    });
    this.loginStats = toSignal(this.adminService.getLoginStats(), {
      initialValue: null,
    });
  }
}
