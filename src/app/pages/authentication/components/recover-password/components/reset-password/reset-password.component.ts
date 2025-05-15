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

  readonly passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);

  readonly isPasswordHidden = signal(true);
  readonly token = signal<string>('');
  readonly passwordErrorMessage = signal<string>('');

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.token.set(params['token'] || '');
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
          console.log(response);
          this.router.navigate(['/auth/sign-in']);
        },
        error: (error) => console.error('Password reset failed', error),
      });
  }

  updateErrorMessage() {
    this.passwordErrorMessage.set(
      getValidationErrorMessage(this.passwordControl, 'password')
    );
  }
}
