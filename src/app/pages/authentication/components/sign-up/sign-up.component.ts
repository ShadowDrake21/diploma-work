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

@Component({
  selector: 'auth-sign-up',
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CustomButtonComponent,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

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
    if (this.signUpForm.invalid) return;

    const { name, email, password, role } = this.signUpForm.getRawValue();

    this.authService
      .register({ username: name, email, password, role })
      .subscribe({
        next: () => {
          this.router.navigate(['/authentication/verification-code'], {
            queryParams: { email },
            replaceUrl: true,
          });
        },
        error: (error) => {
          console.error('Registration failed', error);
        },
      });
  }
}
