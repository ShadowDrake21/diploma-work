import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { getValidationErrorMessage } from '@shared/utils/form.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/authentication/auth.service';
import { CustomButtonComponent } from '../../../../../../shared/components/custom-button/custom-button.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    MatLabel,
    MatIcon,
    CustomButtonComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);

  readonly passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);

  readonly isPasswordHidden = signal(true);
  readonly token = signal<string>('');
  readonly passwordErrorMessage = signal<string>('');
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (params) => {
        this.token.set(params['token'] || '');
        if (!this.token()) {
          this.notificationService.showError('Invalid password reset link');
          this.router.navigate(['/authentication/forgot-password']);
        }
      },
      error: (error) => {
        console.error('Error reading query params:', error);
        this.notificationService.showError('Failed to process reset link');
        this.router.navigate(['/authentication/forgot-password']);
      },
    });

    this.setupPasswordValidation();
  }

  private setupPasswordValidation() {
    this.passwordControl.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateErrorMessage());
  }

  togglePasswordVisibility(event: MouseEvent): void {
    this.isPasswordHidden.update((prev) => !prev);
    event.stopPropagation();
  }

  onSubmit(): void {
    if (this.passwordControl.invalid || !this.passwordControl.value) {
      this.passwordControl.markAsTouched();
      return;
    }
    this.resetPassword(this.passwordControl.value);
  }

  private resetPassword(newPassword: string) {
    this.authService
      .resetPassword({
        token: this.token(),
        newPassword,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Password reset successfully');
          this.router.navigate(['/authentication/sign-in']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.handleResetError(error);
        },
      });
  }

  updateErrorMessage() {
    this.passwordErrorMessage.set(
      getValidationErrorMessage(this.passwordControl, 'password')
    );
  }

  private handleResetError(error: any): void {
    console.error('Password reset failed:', error);

    let errorMessage = 'Failed to reset password';
    if (error?.code === 'EXPIRED_TOKEN') {
      errorMessage = 'Password reset link has expired';
      this.router.navigate(['/authentication/forgot-password']);
    } else if (error?.code === 'INVALID_TOKEN') {
      errorMessage = 'Invalid password reset link';
      this.router.navigate(['/authentication/forgot-password']);
    } else if (error?.status === 400) {
      errorMessage = 'Invalid password format';
    }

    this.notificationService.showError(errorMessage);
  }
}
