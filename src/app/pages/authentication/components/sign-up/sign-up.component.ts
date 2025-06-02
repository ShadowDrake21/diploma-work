import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { matchValidator } from '../../validators/match.validator';
import { getValidationErrorMessage } from '@shared/utils/form.utils';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { AuthService } from '@core/authentication/auth.service';
import {
  SignUpErrorMessages,
  SignUpForm,
} from '@shared/types/forms/auth-form.types';
import { UserRole } from '@shared/enums/user.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '@core/services/notification.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'auth-sign-up',
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CustomButtonComponent,
    MatIcon,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  protected readonly isLoading = signal(false);
  protected readonly formDisabled = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected signUpForm = new FormGroup<SignUpForm>(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
        ],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
        ],
      }),
      role: new FormControl<UserRole>(UserRole.USER, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: matchValidator('password', 'confirmPassword'),
    }
  );

  readonly errorMessages: SignUpErrorMessages = {
    name: signal<string>(''),
    email: signal<string>(''),
    password: signal<string>(''),
    confirmPassword: signal<string>(''),
  };

  ngOnInit(): void {
    this.setupFormValidation();
  }

  private setupFormValidation(): void {
    (
      Object.keys(this.errorMessages) as Array<keyof SignUpErrorMessages>
    ).forEach((key) => {
      const control = this.signUpForm.get(key) as FormControl;
      control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateErrorMessage(key));
    });
  }

  private updateErrorMessage(key: keyof SignUpErrorMessages): void {
    const control = this.signUpForm.get(key) as FormControl;
    this.errorMessages[key].set(getValidationErrorMessage(control, key));
  }

  onSignUp() {
    if (this.signUpForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.formDisabled.set(true);
    this.serverError.set(null);

    const { name, email, password, role } = this.signUpForm.getRawValue();

    this.authService
      .register({ username: name, email, password, role })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Registration successful! Please check your email for verification.'
          );
          this.router.navigate(['/authentication/verification-code'], {
            queryParams: { email },
            replaceUrl: true,
          });
        },
        error: (error) => {
          this.isLoading.set(false);
          this.formDisabled.set(false);

          if (error.error?.errorCode === 'EMAIL_IN_USE') {
            this.signUpForm.controls.email.setErrors({ emailInUse: true });
            this.errorMessages.email.set(error.error.message);
          } else if (error.error?.errorCode === 'WEAK_PASSWORD') {
            this.signUpForm.controls.password.setErrors({ weakPassword: true });
            this.errorMessages.password.set(error.error.message);
          } else {
            const errorMessage =
              error.error?.message ||
              'An error occurred during registration. Please try again.';
            this.serverError.set(errorMessage);
            this.notificationService.showError(errorMessage);
          }
        },
        complete: () => {
          this.isLoading.set(false);
          this.formDisabled.set(false);
        },
      });
  }

  private markAllAsTouched(): void {
    Object.values(this.signUpForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
