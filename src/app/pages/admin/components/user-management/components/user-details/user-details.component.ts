import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@core/services/admin.service';
import { UserService } from '@core/services/users/user.service';
import { ProjectDTO } from '@models/project.model';
import { IUser } from '@models/user.model';
import {
  catchError,
  firstValueFrom,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { UserRole } from '@shared/enums/user.enum';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserRoleChipComponent } from '../utils/user-role-chip/user-role-chip.component';
import { UserStatusChipComponent } from '../utils/user-status-chip/user-status-chip.component';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';
import { IsCurrentUserPipe } from '@pipes/is-current-user.pipe';
import { NotificationService } from '@core/services/notification.service';
import { PageEvent } from '@angular/material/paginator';
import { ProjectService } from '@core/services/project/models/project.service';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-user-details',
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    UserRoleChipComponent,
    UserStatusChipComponent,
    ProfileProjectsComponent,
    IsCurrentUserPipe,
    LoaderComponent,
  ],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);

  readonly user = signal<IUser | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly userProjects = signal<ProjectDTO[]>([]);
  readonly isProcessing = signal<boolean>(false);
  filters = signal<ProjectSearchFilters>({});

  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);
  readonly selectedTabIndex = signal(0);

  readonly UserRole = UserRole;

  ngOnInit(): void {
    this.loadUserData();
  }

  reloadData(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.resetLoadingState();

    this.route.params
      .pipe(
        take(1),
        switchMap((params) => {
          const userId = params['id'];
          console.log(`Loading user data for ID: ${userId}`);
          if (isNaN(userId)) {
            throw new Error('Недійсний ID користувача');
          }

          const idNumber = Number(userId);
          return this.userService.getFullUserById(idNumber).pipe(
            tap((response) => console.log('API response:', response)),
            catchError((err) => {
              console.error('Error in getFullUserById:', err);
              return throwError(() => err); // Re-throw the error
            })
          );
        })
      )
      .subscribe({
        next: (response) => {
          this.user.set(response);
          this.loadUserProjects();
          this.notificationService.showSuccess(
            'Дані користувача завантажено успішно'
          );
        },
        error: (err) => this.handleError(this.getUserFriendlyError(err)),
        complete: () => this.isLoading.set(false),
      });
  }

  private resetLoadingState(): void {
    this.isLoading.set(true);
    this.error.set(null);
  }

  private handleError(errorMessage: string): void {
    this.error.set(errorMessage);
    this.isLoading.set(false);
    this.notificationService.showError(errorMessage);
  }

  private getUserFriendlyError(error: any): string {
    if (error.status === 404) return 'Користувача не знайдено';
    if (error.status === 403)
      return 'Ви не маєте дозволу переглядати цього користувача';
    if (error.status === 400) return 'Недійсний запит';
    return error.message || 'Виникла неочікувана помилка';
  }

  loadUserProjects(): void {
    this.filters.set({});
    this.currentPage.set(0);
    this.loadProjects();
  }

  async promoteUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Підвищити користувача',
      `Ви впевнені, що хочете підвищити ${
        this.user()?.username
      } до адміністратора?`,
      'Підвищити'
    );

    if (confirmed) {
      this.executeUserAction(
        () => this.adminService.promoteToAdmin(this.user()!.id),
        { ...this.user()!, role: UserRole.ADMIN },
        'Користувача успішно підвищено',
        'Не вдалося підвищити користувача',
        'PROMOTE_ERROR'
      );
    }
  }

  async demoteUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Понизити користувача',
      `Ви впевнені, що хочете понизити статус ${
        this.user()?.username
      } до звичайного користувача?`,
      'Понизити'
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.demoteFromAdmin(this.user()!.id),
        { ...this.user()!, role: UserRole.USER },
        'Адміністратора успішно понижено',
        'Не вдалося понизити користувача',
        'DEMOTE_ERROR'
      );
    }
  }

  async deactivateUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Деактивувати користувача',
      `Ви впевнені, що хочете деактивувати ${this.user()?.username}?`,
      'Деактивувати'
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.deactivateUser(this.user()!.id),
        { ...this.user()!, active: false },
        'Користувач успішно деактивовано',
        'Не вдалося деактивувати користувача',
        'DEACTIVATE_ERROR'
      );
    }
  }

  async reactivateUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Реактивувати користувача',
      `Ви впевнені, що хочете реактивувати ${this.user()?.username}?`,
      'Реактивувати'
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.reactivateUser(this.user()!.id),
        { ...this.user()!, active: true },
        'Користувача успішно реактивовано',
        'Не вдалося реактивувати користувача',
        'REACTIVATE_ERROR'
      );
    }
  }

  async deleteUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Видалити користувача',
      `Ви впевнені, що бажаєте назавжди видалити${this.user()?.username}?`,
      'Видалити',
      true
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.deleteUser(this.user()!.id),
        null,
        'Користувача успішно видалено',
        'Не вдалося видалити користувача',
        'DELETE_ERROR',
        () => this.router.navigate(['/admin/users'])
      );
    }
  }

  private async showConfirmation(
    title: string,
    message: string,
    confirmText: string,
    warn: boolean = false
  ): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title,
        message,
        confirmText,
        warn,
      },
    });
    return firstValueFrom(dialogRef.afterClosed());
  }

  private async executeUserAction(
    action: () => any,
    updatedUser: IUser | null,
    successMessage: string,
    errorMessage: string,
    errorCode: string,
    onSuccess?: () => void
  ): Promise<void> {
    try {
      this.isProcessing.set(true);
      const response = (await firstValueFrom(action())) as any;

      this.notificationService.showSuccess(successMessage);
      if (updatedUser) this.user.set(updatedUser);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(`${errorCode}:`, err);
      const message = err.error?.message || errorMessage;
      this.notificationService.showError(message);
    } finally {
      this.isProcessing.set(false);
    }
  }

  loadProjects() {
    const userId = this.user()?.id;
    if (!userId) return;

    const currentTab = this.selectedTabIndex();

    this.isLoading.set(true);
    this.projectService
      .getMyProjects(this.filters(), this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.userProjects.set(response.data || []);
          this.totalItems.set(response.totalItems || 0);

          this.selectedTabIndex.set(currentTab);
        },
        error: (err) => {
          console.error('Failed to load filtered projects:', err);
          this.notificationService.showError('Не вдалося завантажити проекти');
          this.isLoading.set(false);

          this.selectedTabIndex.set(currentTab);
        },
        complete: () => this.isLoading.set(false),
      });
  }

  onFiltering(filters: ProjectSearchFilters): void {
    this.currentPage.set(0);
    this.filters.set(filters);
    this.loadProjects();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
    this.loadProjects();
  }

  goBack(): void {
    this.router.navigate(['/admin/users-management/users']);
  }
}
