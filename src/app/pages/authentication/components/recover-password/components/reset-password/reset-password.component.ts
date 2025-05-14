import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { getValidationErrorMessage } from '@shared/utils/form.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { AuthService } from '@core/authentication/auth.service';

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
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  token: string = '';

  passwordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
    });

    this.passwordController.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateErrorMessage());
  }

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  passwordErrorMessage = signal<string>('');

  onResetPassword() {
    if (!this.passwordController.value) {
      return;
    }

    this.authService
      .resetPassword({
        token: this.token,
        newPassword: this.passwordController.value,
      })
      .subscribe({
        next: (response) => {
          console.log(response);
          this.router.navigate(['/auth/sign-in']);
        },
        error: (error) => {
          console.error('Password reset failed', error);
        },
      });
  }

  updateErrorMessage() {
    this.passwordErrorMessage.set(
      getValidationErrorMessage(this.passwordController, 'password')
    );
  }
}
