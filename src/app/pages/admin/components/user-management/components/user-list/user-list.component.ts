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
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatCard, MatCardModule } from '@angular/material/card';

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
    MatCardModule,
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly observer = inject(BreakpointObserver);

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

  isMobile = signal(true);

  constructor() {
    effect(() => {
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile.set(false);
      } else {
        this.isMobile.set(true);
      }
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
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users.set(response.data!);
            this.totalItems.set(response.totalItems);
          } else {
            this.handleError(
              response.message || 'Помилка завантаження користувачів'
            );
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
      'Підвищити користувача',
      `Ви впевнені, що хочете підвищити ${user.username} до адміністратора?`,
      'Підвищити',
      () =>
        this.executeUserAction(
          this.adminService.promoteToAdmin(user.id),
          'Користувача успішно підвищено до адміністратора',
          'підвищити'
        )
    );
  }

  demoteUser(user: IUser): void {
    this.showConfirmationDialog(
      'Понизити користувача',
      `Ви впевнені, що хочете понизити ${user.username} до звичайного користувача?`,
      'Понизити',
      () =>
        this.executeUserAction(
          this.adminService.demoteFromAdmin(user.id),
          'Адміністратора успішно понижено',
          'понизити'
        )
    );
  }

  deactivateUser(user: IUser): void {
    this.showConfirmationDialog(
      'Деактивувати користувача',
      `Ви впевнені, що хочете деактивувати ${user.username}?`,
      'Деактивувати',
      () =>
        this.executeUserAction(
          this.adminService.deactivateUser(user.id),
          'Користувача успішно деактивовано',
          'деактивувати'
        )
    );
  }

  reactivateUser(user: IUser): void {
    this.showConfirmationDialog(
      'Реактивувати користувача',
      `Ви впевнені, що хочете реактувувати ${user.username}?`,
      'Реактивація',
      () =>
        this.executeUserAction(
          this.adminService.reactivateUser(user.id),
          'Користувач успішно реактивований',
          'реактивувати'
        )
    );
  }

  deleteUser(user: IUser): void {
    this.showConfirmationDialog(
      'Видалити користувача',
      `Ви впевнені, що хочете остаточно видалити ${user.username}? Цю дію не можна скасувати.`,
      'Видалити',
      () =>
        this.executeUserAction(
          this.adminService.deleteUser(user.id),
          'Користувача успішно видалено',
          'видалити',
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
      return 'Помилка мережі: Не вдалося підключитися до сервера';
    }
    if (error.status === 403) {
      return 'Неавторизовано: Ви не маєте дозволу переглядати користувачів';
    }
    if (error.status === 404) {
      return 'Користувачів не знайдено';
    }
    return error.message || 'Помилка завантаження користувачів';
  }

  private getActionErrorMessage(error: any, actionType: string): string {
    if (error.status === 403) {
      return `У вас немає дозволу ${actionType} користувачів`;
    }
    if (error.status === 409) {
      return `Неможливо ${actionType} користувача: ${error.error.message}`;
    }
    return error.error?.message || `Не вдалося ${actionType} користувача`;
  }
}
