import { Component, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IUpdateUserProfile, IUser } from '@models/user.model';
import { ProfileAvatarComponent } from './components/profile-avatar/profile-avatar.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileViewComponent } from './components/profile-view/profile-view.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { currentUserSig } from '@core/shared/shared-signals';

@Component({
  selector: 'profile-info',
  imports: [
    ProfileAvatarComponent,
    ProfileEditComponent,
    ProfileViewComponent,
    MatProgressSpinner,
    MatProgressBarModule,
  ],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.scss',
})
export class ProfileInfoComponent implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly _snackBar = inject(MatSnackBar);
  private subscriptions: Subscription[] = [];

  readonly editMode = signal(false);
  readonly isLoading = signal(false);
  readonly user = signal<IUser | null>(null);
  readonly selectedFile = signal<File | null>(null);

  constructor() {
    this.loadUser();
  }

  onSave(profileData: any): void {
    this.isLoading.set(true);
    const sub = this.userService
      .updateUserProfile(this.formProfileData(profileData))
      .subscribe({
        next: (response) => {
          this.user.set({ ...this.user(), ...profileData });
          this._snackBar.open('Profile updated successfully.', 'Close', {
            duration: 3000,
          });
          this.editMode.set(false);
        },
        error: () => {
          this._snackBar.open(
            'Failed to update profile. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
        },
        complete: () => this.isLoading.set(false),
      });

    this.subscriptions.push(sub);
  }

  handleAvatarSucess(updatedUser: IUser): void {
    this.user.set(updatedUser);
    currentUserSig.set(updatedUser);
    this.showMessage('Avatar updated successfully');
  }

  handleAvatarFailure(): void {
    this.showMessage('Failed to update avatar. Please try again.');
  }

  private loadUser(): void {
    this.subscriptions.push(
      this.userService.getCurrentUser().subscribe({
        next: (response) => this.user.set(response.data),
        error: () => this.showMessage('Failed to load user profile'),
      })
    );
  }

  private showMessage(message: string): void {
    this._snackBar.open(message, 'Close', { duration: 3000 });
  }

  private formProfileData(data: any): IUpdateUserProfile {
    return {
      phoneNumber: data.phoneNumber || undefined,
      dateOfBirth: new Date(data.dateOfBirth ?? '').toISOString().split('T')[0],
      userType: data.userType || undefined,
      universityGroup: data.universityGroup || undefined,
      socialLinks: data.socialLinks || [],
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
