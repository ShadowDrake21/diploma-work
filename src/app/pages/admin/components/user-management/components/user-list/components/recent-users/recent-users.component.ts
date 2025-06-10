import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';
import { UserService } from '@core/services/users/user.service';
import { LoaderComponent } from '../../../../../../../../shared/components/loader/loader.component';
import { BreakpointObserver } from '@angular/cdk/layout';

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
  styleUrl: './recent-users.component.scss',
})
export class RecentUsersComponent {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);

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
