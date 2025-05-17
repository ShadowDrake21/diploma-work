import { Component, inject, OnDestroy, signal } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { map, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IUpdateUserProfile, IUser } from '@models/user.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileAvatarComponent } from './components/profile-avatar/profile-avatar.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileViewComponent } from './components/profile-view/profile-view.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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

  readonly editMode = signal(false);
  readonly isLoading = signal(false);

  readonly user = signal<IUser | null>(null);

  constructor() {
    this.userService
      .getCurrentUser()
      .pipe(map((response) => response.data))
      .subscribe((user) => this.user.set(user));
  }

  onEdit(): void {
    this.editMode.set(true);
  }

  onCancel(): void {
    this.editMode.set(false);
  }

  private subscriptions: Subscription[] = [];

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

  onAvatarUpload(file: File): void {
    this.isLoading.set(true);
    const sub = this.userService.updateUserAvatar(file).subscribe({
      next: (response) => {
        this._snackBar.open('Avatar updated successfully.', 'Close', {
          duration: 3000,
        });
      },
      error: () => {
        this._snackBar.open(
          'Failed to update avatar. Please try again.',
          'Close',
          { duration: 3000 }
        );
      },
      complete: () => this.isLoading.set(false),
    });

    this.subscriptions.push(sub);
  }

  private formProfileData(data: any): IUpdateUserProfile {
    return {
      phoneNumber: data.phoneNumber || undefined,
      dateOfBirth: new Date(data.dateOfBirth ?? '').toISOString().split('T')[0],
      userType: data.userType || undefined,
      universityGroup: data.universityGroup || undefined,
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
