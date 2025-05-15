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
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  destroyRef = inject(DestroyRef);

  private authService = inject(AuthService);
  private router = inject(Router);

  protected signInForm = new FormGroup<SignInForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  });

  readonly isPasswordHidden = signal(true);

  readonly errorMessages = {
    email: signal<string>(''),
    password: signal<string>(''),
  };

  ngOnInit(): void {
    this.setupFormValidation();
  }

  private setupFormValidation() {
    Object.entries(this.signInForm.controls).forEach(([key, control]) => {
      if (key !== 'rememberMe') {
        control.statusChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() =>
            this.updateErrorMessage(key as keyof SignInErrorMessages)
          );
      }
    });
  }

  togglePasswordVisibility(event: MouseEvent) {
    this.isPasswordHidden.update((prev) => !prev);
    event.stopPropagation();
  }

  onSubmit() {
    if (this.signInForm.invalid) return;

    const { email, password } = this.signInForm.value as SignInFormValues;

    this.authService.login({ email, password }).subscribe({
      next: (token) => this.router.navigate(['/']),
      error: (error) => console.error('Login failed', error),
    });
  }

  private updateErrorMessage(key: keyof SignInErrorMessages): void {
    const control = this.signInForm.get(key) as FormControl;
    if (control) {
      this.errorMessages[key].set(getValidationErrorMessage(control, key));
    }
  }
}
