import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminService } from '@core/services/admin.service';
import { IUser } from '@models/user.model';
import { UserRoleChipComponent } from '../utils/user-role-chip/user-role-chip.component';
import { UserStatusChipComponent } from '../utils/user-status-chip/user-status-chip.component';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { RecentUsersComponent } from './components/recent-users/recent-users.component';
import { SortingDirection } from '@shared/enums/sorting.enum';
import { RoleFormatPipe } from '@pipes/role-format.pipe';
import { currentUserSig } from '@core/shared/shared-signals';
import { IsCurrentUserPipe } from '@pipes/is-current-user.pipe';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    UserRoleChipComponent,
    UserStatusChipComponent,
    RecentUsersComponent,
    RoleFormatPipe,
    IsCurrentUserPipe,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users = signal<IUser[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalItems = signal<number>(0);

  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  sortField = signal<string>('id');
  sortDirection = signal<SortingDirection>(SortingDirection.ASC);

  displayedColumns = computed(() => [
    'id',
    'avatar',
    'username',
    'email',
    'role',
    'status',
    'createdAt',
    'actions',
  ]);

  constructor() {
    effect(() => {
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.adminService
      .getAllUsers(
        this.currentPage(),
        this.pageSize(),
        this.sortField(),
        this.sortDirection()
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users.set(response.data);
            this.totalItems.set(response.totalItems);
          } else {
            this.error.set(response.message || 'Failed to load users');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load users');
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sortState: Sort): void {
    this.sortField.set(sortState.active);
    this.sortDirection.set(
      sortState.direction.toString().toUpperCase() as SortingDirection
    );
    this.currentPage.set(0);
  }

  promoteUser(user: IUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Promote User',
        message: `Are you sure you want to promote ${user.username} to admin?`,
        confirmText: 'Promote',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.promoteToAdmin(user.id).subscribe({
          next: () => {
            this.snackBar.open('User promoted successfully', 'Close', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (err) => {
            this.snackBar.open(
              err.error.message || 'Failed to promote user',
              'Close',
              { duration: 3000 }
            );
          },
        });
      }
    });
  }

  demoteUser(user: IUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Demote User',
        message: `Are you sure you want to demote ${user.username} to regular user?`,
        confirmText: 'Demote',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.demoteFromAdmin(user.id).subscribe({
          next: () => {
            this.snackBar.open('Admin demoted successfully', 'Close', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (err) => {
            this.snackBar.open(
              err.error.message || 'Failed to demote user',
              'Close',
              { duration: 3000 }
            );
          },
        });
      }
    });
  }

  deactivateUser(user: IUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate User',
        message: `Are you sure you want to deactivate ${user.username}?`,
        confirmText: 'Deactivate',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.deactivateUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deactivated successfully', 'Close', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (err) => {
            this.snackBar.open(
              err.error.message || 'Failed to deactivate user',
              'Close',
              { duration: 3000 }
            );
          },
        });
      }
    });
  }

  reactivateUser(user: IUser): void {
    this.adminService.reactivateUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('User reactivated successfully', 'Close', {
          duration: 3000,
        });
        this.loadUsers();
      },
      error: (err) => {
        this.snackBar.open(
          err.error.message || 'Failed to reactivate user',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  deleteUser(user: IUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`,
        confirmText: 'Delete',
        warn: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (err) => {
            this.snackBar.open(
              err.error.message || 'Failed to delete user',
              'Close',
              { duration: 3000 }
            );
          },
        });
      }
    });
  }

  viewUserDetails(user: IUser): void {
    this.router.navigate(['/admin/users-management/users', user.id]);
  }
}
