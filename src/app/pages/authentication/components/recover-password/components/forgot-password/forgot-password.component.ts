import { Component, inject } from '@angular/core';
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
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new ErrorMatcher();

  onForgotPassword() {
    if (!this.emailFormControl.value) {
      return;
    }

    this.authService
      .requestPasswordReset(this.emailFormControl.value)
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.error('Request password failed', error);
        },
      });
  }
}
