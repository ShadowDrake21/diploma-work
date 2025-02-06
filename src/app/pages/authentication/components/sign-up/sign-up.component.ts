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

type SignUpForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
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
  destroyRef = inject(DestroyRef);

  private router = inject(Router);
  private authService = inject(AuthService);

  protected signUpForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30),
      ]),
      role: new FormControl<'user' | 'admin'>('user', Validators.required),
    },
    {
      validators: matchValidator('password', 'confirmPassword'),
    }
  );

  // VERIFICATION CODE CHECK
  onSignUp() {
    const { email, password, role } = this.signUpForm.value;

    if (!email || !password || !role) return;

    this.authService.register(email, password, role).subscribe({
      next: (token) => {
        localStorage.setItem('authToken', token);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Registration failed', error);
      },
    });
    this.router.navigate(['/authentication/verification-code']);
  }

  ngOnInit(): void {
    Object.entries(this.signUpForm.controls).forEach(([key, control]) => {
      control.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateErrorMessage(key as keyof SignUpForm));
    });
  }

  errorMessages = {
    name: signal<string>(''),
    email: signal<string>(''),
    password: signal<string>(''),
    confirmPassword: signal<string>(''),
  };

  updateErrorMessage(key: keyof SignUpForm) {
    const control = this.signUpForm.controls[key];
    this.errorMessages[key].set(getValidationErrorMessage(control, key));
  }
}
