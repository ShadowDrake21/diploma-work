import { Component, inject, OnDestroy, signal } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { ErrorMatcher } from '@shared/utils/errorMatcher.utils';
import { CustomButtonComponent } from '../../../../../../shared/components/custom-button/custom-button.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    CustomButtonComponent,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  readonly matcher = new ErrorMatcher();
  readonly isLoading = signal(false);
  readonly cooldown = signal(0);
  private cooldownInterval: any;

  onSubmit() {
    if (this.emailControl.invalid || !this.emailControl.value) {
      this.emailControl.markAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService
      .requestPasswordReset({ email: this.emailControl.value })
      .subscribe({
        next: (response) => {
          console.log(response);
          this.startCooldownTimer(60);
          this.notificationService.showSuccess(
            'Password reset link sent to your email'
          );
        },
        error: (error) => {
          this.handleRequestError(error);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  private handleRequestError(error: any): void {
    console.error('Password reset request failed:', error);

    let errorMessage = 'Failed to send password reset link';
    if (error?.code === 'USER_NOT_FOUND') {
      errorMessage = 'No account found with this email';
    } else if (error?.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
      this.startCooldownTimer(error.headers?.get('Retry-After') || 60);
    }

    this.notificationService.showError(errorMessage);
  }

  private startCooldownTimer(seconds: number): void {
    this.cooldown.set(seconds);
    clearInterval(this.cooldownInterval);

    this.cooldownInterval = setInterval(() => {
      this.cooldown.update((value) => {
        if (value <= 1) {
          clearInterval(this.cooldownInterval);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }

  goToSignIn() {
    this.router.navigate(['/authentication/sign-in']);
  }

  ngOnDestroy(): void {
    clearInterval(this.cooldownInterval);
  }
}
