import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
import { IsCurrentUserPipe } from '@pipes/is-current-user.pipe';
import { NotificationService } from '@core/services/notification.service';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../../../shared/components/loader/loader.component';

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
    IsCurrentUserPipe,
    LoaderComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

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
            this.users.set(response.data!);
            this.totalItems.set(response.totalItems);
          } else {
            this.handleError(response.message || 'Failed to load users');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.handleError(this.getErrorMessage(err));
          this.isLoading.set(false);
        },
      });
  }

  promoteUser(user: IUser): void {
    this.showConfirmationDialog(
      'Promote User',
      `Are you sure you want to promote ${user.username} to admin?`,
      'Promote',
      () =>
        this.executeUserAction(
          this.adminService.promoteToAdmin(user.id),
          'User promoted to admin successfully',
          'promote'
        )
    );
  }

  demoteUser(user: IUser): void {
    this.showConfirmationDialog(
      'Demote User',
      `Are you sure you want to demote ${user.username} to regular user?`,
      'Demote',
      () =>
        this.executeUserAction(
          this.adminService.demoteFromAdmin(user.id),
          'Admin demoted successfully',
          'demote'
        )
    );
  }

  deactivateUser(user: IUser): void {
    this.showConfirmationDialog(
      'Deactivate User',
      `Are you sure you want to deactivate ${user.username}?`,
      'Deactivate',
      () =>
        this.executeUserAction(
          this.adminService.deactivateUser(user.id),
          'User deactivated successfully',
          'deactivate'
        )
    );
  }

  reactivateUser(user: IUser): void {
    this.showConfirmationDialog(
      'Reactivate User',
      `Are you sure you want to reactivate ${user.username}?`,
      'Reactivate',
      () =>
        this.executeUserAction(
          this.adminService.reactivateUser(user.id),
          'User reactivated successfully',
          'reactivate'
        )
    );
  }

  deleteUser(user: IUser): void {
    this.showConfirmationDialog(
      'Delete User',
      `Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`,
      'Delete',
      () =>
        this.executeUserAction(
          this.adminService.deleteUser(user.id),
          'User deleted successfully',
          'delete',
          true
        ),
      true
    );
  }

  viewUserDetails(user: IUser): void {
    this.router.navigate(['/admin/users-management/users', user.id]);
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

  private showConfirmationDialog(
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void,
    warn: boolean = false
  ): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title,
        message,
        confirmText,
        warn,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        onConfirm();
      }
    });
  }

  private executeUserAction(
    action$: Observable<any>,
    successMessage: string,
    actionType: string,
    reloadOnSuccess: boolean = true
  ): void {
    action$.subscribe({
      next: () => {
        this.notificationService.showSuccess(successMessage);
        if (reloadOnSuccess) {
          this.loadUsers();
        }
      },
      error: (err) => {
        this.notificationService.showError(
          this.getActionErrorMessage(err, actionType)
        );
      },
    });
  }

  private handleError(message: string): void {
    this.error.set(message);
    this.notificationService.showError(message);
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Network error: Unable to connect to server';
    }
    if (error.status === 403) {
      return 'Unauthorized: You do not have permission to view users';
    }
    if (error.status === 404) {
      return 'No users found';
    }
    return error.message || 'Failed to load users';
  }

  private getActionErrorMessage(error: any, actionType: string): string {
    if (error.status === 403) {
      return `You don't have permission to ${actionType} users`;
    }
    if (error.status === 409) {
      return `Cannot ${actionType} user: ${error.error.message}`;
    }
    return error.error?.message || `Failed to ${actionType} user`;
  }
}
