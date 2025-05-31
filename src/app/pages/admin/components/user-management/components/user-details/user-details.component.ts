import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@core/services/admin.service';
import { UserService } from '@core/services/users/user.service';
import { ProjectDTO } from '@models/project.model';
import { IUser } from '@models/user.model';
import { firstValueFrom, switchMap, tap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { UserRole } from '@shared/enums/user.enum';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserRoleChipComponent } from '../utils/user-role-chip/user-role-chip.component';
import { UserStatusChipComponent } from '../utils/user-status-chip/user-status-chip.component';
import { ProjectsComponent } from '../../../../../projects/projects.component';
import { ProfileProjectsComponent } from '../../../../../../shared/components/profile-projects/profile-projects.component';
import { currentUserSig } from '@core/shared/shared-signals';
import { IsCurrentUserPipe } from '@pipes/is-current-user.pipe';

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
    ProjectsComponent,
    ProfileProjectsComponent,
    IsCurrentUserPipe,
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly user = signal<IUser | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly userProjects = signal<ProjectDTO[]>([]);
  readonly isProcessing = signal<boolean>(false);

  readonly UserRole = UserRole;

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.route.params
      .pipe(
        tap(() => this.resetLoadingState()),
        switchMap((params) => this.userService.getFullUserById(+params['id']))
      )
      .subscribe({
        next: (response) => this.handleUserResponse(response),
        error: (err) => this.handleError(err),
      });
  }

  private resetLoadingState(): void {
    this.isLoading.set(true);
    this.error.set(null);
  }

  private handleUserResponse(response: any): void {
    if (response.success) {
      this.user.set(response.data);
      this.loadUserProjects();
    } else {
      this.error.set(response.message || 'Failed to load user');
    }
    this.isLoading.set(false);
  }

  private handleError(error: any): void {
    this.error.set(error.message || 'Failed to load user');
    this.isLoading.set(false);
  }

  loadUserProjects(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.userService.getUserProjects(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.userProjects.set(response.data!);
        }
      },
      error: (err) => console.error('Failed to load user projects', err),
    });
  }

  async promoteUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Promote User',
      `Are you sure you want to promote ${this.user()?.username} to admin?`,
      'Promote'
    );

    if (confirmed) {
      this.executeUserAction(
        () => this.adminService.promoteToAdmin(this.user()!.id),
        { ...this.user()!, role: UserRole.ADMIN },
        'User promoted successfully',
        'Failed to promote user'
      );
    }
  }

  async demoteUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Demote User',
      `Are you sure you want to demote ${
        this.user()?.username
      } to regular user?`,
      'Demote'
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.demoteFromAdmin(this.user()!.id),
        { ...this.user()!, role: UserRole.USER },
        'Admin demoted successfully',
        'Failed to demote user'
      );
    }
  }

  async deactivateUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Deactivate User',
      `Are you sure you want to deactivate ${this.user()?.username}?`,
      'Deactivate'
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.deactivateUser(this.user()!.id),
        { ...this.user()!, active: false },
        'User deactivated successfully',
        'Failed to deactivate user'
      );
    }
  }

  async reactivateUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Reactivate User',
      `Are you sure you want to reactivate ${this.user()?.username}?`,
      'Deactivate'
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.reactivateUser(this.user()!.id),
        { ...this.user()!, active: true },
        'User reactivated successfully',
        'Failed to reactivate user'
      );
    }
  }

  async deleteUser(): Promise<void> {
    const confirmed = await this.showConfirmation(
      'Delete User',
      `Are you sure you want to permanently delete ${this.user()?.username}?`,
      'Delete',
      true
    );

    if (confirmed) {
      await this.executeUserAction(
        () => this.adminService.deleteUser(this.user()!.id),
        null,
        'User deleted successfully',
        'Failed to delete user',
        () => this.router.navigate(['/admin/users'])
      );
    }
  }

  // helper
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
    onSuccess?: () => void
  ): Promise<void> {
    try {
      this.isProcessing.set(true);
      await firstValueFrom(action());

      this.snackBar.open(successMessage, 'Close', { duration: 3000 });
      if (updatedUser) this.user.update(() => updatedUser);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      this.snackBar.open(err.error?.message || errorMessage, 'Close', {
        duration: 3000,
      });
    } finally {
      this.isProcessing.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users-management/users']);
  }
}
