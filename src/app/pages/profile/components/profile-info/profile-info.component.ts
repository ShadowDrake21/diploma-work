import { Component, inject, OnDestroy, signal } from '@angular/core';
import { UserService } from '@core/services/users/user.service';
import { Subscription } from 'rxjs';
import { IUpdateUserProfile, IUser } from '@models/user.model';
import { ProfileAvatarComponent } from './components/profile-avatar/profile-avatar.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileViewComponent } from './components/profile-view/profile-view.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { currentUserSig } from '@core/shared/shared-signals';
import { NotificationService } from '@core/services/notification.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'profile-info',
  imports: [
    ProfileAvatarComponent,
    ProfileEditComponent,
    ProfileViewComponent,
    MatProgressBarModule,
    MatIcon,
  ],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.scss',
})
export class ProfileInfoComponent implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private subscriptions: Subscription[] = [];

  readonly editMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isProfileLoading = signal(false);
  readonly user = signal<IUser | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadUser();
  }

  onSave(profileData: any): void {
    this.isSaving.set(true);
    this.error.set(null);

    const sub = this.userService
      .updateUserProfile(this.formProfileData(profileData))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const updatedUser = { ...this.user()!, ...profileData };
            this.user.set(updatedUser);
            currentUserSig.set(updatedUser);
            this.notificationService.showSuccess(
              'Profile updated successfully'
            );
            this.editMode.set(false);
          } else {
            this.error.set(response.message || 'Failed to update profile');
          }
        },
        error: (err) => {
          this.error.set(
            err.error?.message || 'Failed to update profile. Please try again.'
          );
        },
        complete: () => this.isSaving.set(false),
      });

    this.subscriptions.push(sub);
  }

  handleAvatarSucess(updatedUser: IUser): void {
    this.user.set(updatedUser);
    currentUserSig.set(updatedUser);
    this.notificationService.showSuccess('Avatar updated successfully');
  }

  handleAvatarFailure(error: any): void {
    const message =
      error.status === 413
        ? 'Image size is too large'
        : error.status === 415
        ? 'Unsupported image format'
        : 'Failed to update avatar. Please try again.';

    this.notificationService.showError(message);
  }

  private loadUser(): void {
    this.isProfileLoading.set(true);
    this.error.set(null);

    const sub = this.userService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success) {
          this.user.set(response.data!);
        } else {
          this.error.set(response.message || 'Failed to load profile data');
        }
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to load profile. Please try again.'
        );
      },
      complete: () => this.isProfileLoading.set(false),
    });
    this.subscriptions.push(sub);
  }

  retryLoadUser(): void {
    this.loadUser();
  }

  private formProfileData(data: any): IUpdateUserProfile {
    return {
      phoneNumber: data.phoneNumber || undefined,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split('T')[0]
        : undefined,
      userType: data.userType || undefined,
      universityGroup: data.universityGroup || undefined,
      socialLinks: data.socialLinks || [],
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
