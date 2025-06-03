import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AuthService } from '@core/authentication/auth.service';
import { UserService } from '@core/services/users/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { profileMenuItems } from '../../content/header.content';
import { currentUserSig } from '@core/shared/shared-signals';
import { DEFAULT_AVATAR_URL } from '@core/constants/default-variables';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    ClickOutsideDirective,
    TruncateTextPipe,
    MatDivider,
    MatIcon,
  ],
  templateUrl: './profile-dropdown.component.html',
  styleUrl: './profile-dropdown.component.scss',
})
export class ProfileDropdownComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  readonly isProfileOpened = signal(false);
  readonly currentUser = currentUserSig.asReadonly();

  faUser = faUser;

  readonly profileMenuItems = profileMenuItems;

  toggleProfile(): void {
    this.isProfileOpened.update((opened) => !opened);
  }

  closeProfile(): void {
    this.isProfileOpened.set(false);
  }

  onLogout(): void {
    this.authService.logout();
    this.closeProfile();
  }

  getAvatarUrl(): string {
    return this.currentUser()?.avatarUrl || DEFAULT_AVATAR_URL;
  }
}
