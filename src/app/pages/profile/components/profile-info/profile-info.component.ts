import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { UserService } from '@core/services/users/user.service';
import { finalize, Subscription } from 'rxjs';
import { IUpdateUserProfile, IUser } from '@models/user.model';
import { ProfileAvatarComponent } from './components/profile-avatar/profile-avatar.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileViewComponent } from './components/profile-view/profile-view.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { currentUserSig } from '@core/shared/shared-signals';
import { NotificationService } from '@core/services/notification.service';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'profile-info',
  imports: [
    ProfileAvatarComponent,
    ProfileEditComponent,
    ProfileViewComponent,
    MatProgressBarModule,
    MatIcon,
    LoaderComponent,
    MatButtonModule,
  ],
  templateUrl: './profile-info.component.html',
})
export class ProfileInfoComponent implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
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
          const updatedUser = { ...this.user()!, ...profileData };
          this.user.set(updatedUser);
          currentUserSig.set(updatedUser);
          this.notificationService.showSuccess('Профіль успішно оновлено');
          this.editMode.set(false);
        },
        error: (err) => {
          this.error.set(
            err.error?.message ||
              'Не вдалося оновити профіль. Спробуйте ще раз.'
          );
        },
        complete: () => this.isSaving.set(false),
      });

    this.subscriptions.push(sub);
  }

  handleAvatarSucess(updatedUser: IUser): void {
    this.user.set(updatedUser);
    currentUserSig.set(updatedUser);
    this.cdr.detectChanges();
    this.notificationService.showSuccess('Аватар успішно оновлено');
  }

  handleAvatarFailure(error: any): void {
    const message =
      error.status === 413
        ? 'Розмір зображення завеликий'
        : error.status === 415
        ? 'Непідтримуваний формат зображення'
        : 'Не вдалося оновити аватар. Спробуйте ще раз.';

    this.notificationService.showError(message);
  }

  private loadUser(): void {
    this.isProfileLoading.set(true);
    this.error.set(null);

    const sub = this.userService
      .getCurrentUser()
      .pipe(finalize(() => this.isProfileLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.user.set(response);
        },
        error: (err) => {
          this.error.set(
            err.error?.message ||
              'Не вдалося завантажити профіль. Спробуйте ще раз.'
          );
        },
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
