import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { matchValidator } from '../../validators/match.validator';
import { getValidationErrorMessage } from '@shared/utils/form.utils';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { AuthService } from '@core/authentication/auth.service';
import {
  SignUpErrorMessages,
  SignUpForm,
} from '@shared/types/forms/auth-form.types';
import { UserRole } from '@shared/enums/user.enum';
import { NotificationService } from '@core/services/notification.service';
import { MatIcon } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

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
})
export class SignUpComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  readonly isLoading = signal(false);
  readonly formDisabled = signal(false);
  readonly serverError = signal<string | null>(null);

  signUpForm = new FormGroup<SignUpForm>(
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
        .pipe(takeUntil(this.destroy$))
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Реєстрація успішна! Будь ласка, перевірте свою електронну пошту для підтвердження.'
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
          } else if (
            error.error?.errorCode === 'WEAK_PASSWORD' ||
            error.errorCode === 'WEAK_PASSWORD'
          ) {
            this.signUpForm.controls.password.setErrors({ weakPassword: true });
            this.errorMessages.password.set(error.error.message);
          } else {
            const errorMessage =
              error.error?.message ||
              error.message ||
              'Під час реєстрації сталася помилка. Спробуйте ще раз.';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
