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
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { getValidationErrorMessage } from '@shared/utils/form.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { AuthService } from '@core/authentication/auth.service';
import {
  SignInErrorMessages,
  SignInForm,
  SignInFormValues,
} from '@shared/types/forms/auth-form.types';
import { switchMap } from 'rxjs';
import { UserStore } from '@core/services/stores/user-store.service';
import { NotificationService } from '@core/services/notification.service';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { ErrorTruncateTextPipe } from '@pipes/error-truncate-text.pipe';

@Component({
  selector: 'auth-sign-in',
  imports: [
    FormsModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    CustomButtonComponent,
    ErrorTruncateTextPipe,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly userStore = inject(UserStore);

  signInForm = new FormGroup<SignInForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  });

  readonly isPasswordHidden = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessages = {
    email: signal<string>(''),
    password: signal<string>(''),
  };
  readonly formError = signal<string | null>(null);

  ngOnInit(): void {
    this.setupFormValidation();
  }

  private setupFormValidation() {
    Object.entries(this.signInForm.controls).forEach(([key, control]) => {
      if (key !== 'rememberMe') {
        control.statusChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.updateErrorMessage(key as keyof SignInErrorMessages);
            this.formError.set(null);
          });
      }
    });
  }

  togglePasswordVisibility(event: MouseEvent) {
    this.isPasswordHidden.update((prev) => !prev);
    event.stopPropagation();
  }

  onSubmit() {
    if (this.signInForm.invalid) {
      this.formError.set(
        "Будь ласка, заповніть всі обов'язкові поля правильно"
      );
      return;
    }

    this.isLoading.set(true);
    this.formError.set(null);

    this.authService
      .login(this.signInForm.value as SignInFormValues)
      .pipe(switchMap(() => this.userStore.loadCurrentUser()))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.notificationService.showSuccess('Успішний вхід');
        },
        error: (error) => {
          console.error('Login failed', error);
          this.isLoading.set(false);

          let errorMessage = 'Невдала спроба входу';
          if (error.code === 'INVALID_CREDENTIALS') {
            errorMessage = 'Невірний email або пароль';
          } else if (error.code === 'EMAIL_NOT_VERIFIED') {
            errorMessage =
              'Будь ласка, підтвердіть вашу електронну пошту перед входом.';
          }

          this.formError.set(errorMessage);
          this.notificationService.showError(errorMessage);
        },
        complete: () => this.isLoading.set(false),
      });
  }

  private updateErrorMessage(key: keyof SignInErrorMessages): void {
    const control = this.signInForm.get(key) as FormControl;
    if (control) {
      this.errorMessages[key].set(getValidationErrorMessage(control, key));
    }
  }
}
