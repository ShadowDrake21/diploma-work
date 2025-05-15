import { Component, inject, signal } from '@angular/core';
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
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  readonly matcher = new ErrorMatcher();
  readonly isLoading = signal(false);
  readonly isSuccess = signal(false);

  onSubmit() {
    if (this.emailControl.invalid || !this.emailControl.value) {
      return;
    }

    this.isLoading.set(true);

    this.authService
      .requestPasswordReset({ email: this.emailControl.value })
      .subscribe({
        next: (response) => {
          console.log(response);
          this.isSuccess.set(true);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Request password failed', error);
          this.isLoading.set(false);
        },
      });
  }

  goToSignIn() {
    this.router.navigate(['/auth/sign-in']);
  }
}
