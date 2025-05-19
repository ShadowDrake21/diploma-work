import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@core/services/admin.service';
import { matchValidator } from '@pages/authentication/validators/match.validator';
import { UserRole } from '@shared/enums/user.enum';
import { SignUpForm } from '@shared/types/forms/auth-form.types';

@Component({
  selector: 'app-admin-sign-up',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './admin-sign-up.component.html',
  styleUrl: './admin-sign-up.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class AdminSignUpComponent implements OnInit {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly isLoading = signal<boolean>(false);
  readonly token = signal<string | null>(null);
  readonly email = signal<string | null>(null);

  readonly adminForm = new FormGroup(
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
    },
    { validators: matchValidator('password', 'confirmPassword') }
  );

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['token'] && params['email']) {
        this.token.set(params['token']);
        this.email.set(params['email']);
        this.adminForm.patchValue({
          email: params['email'],
        });
        this.adminForm.controls.email.disable();
      }
    });
  }

  onSubmit(): void {
    if (this.adminForm.invalid) return;

    this.isLoading.set(true);
    const formData = this.adminForm.getRawValue();

    this.adminService
      .completeAdminRegistration(this.token()!, {
        username: formData.name,
        email: formData.email,
        password: formData.password,
      })
      .subscribe({
        next: () => {
          localStorage.setItem('admin_signup_complete', 'true');
          this.snackBar.open(
            'Admin registration completed successfully',
            'Close',
            {
              duration: 3000,
            }
          );
          this.router.navigate(['/admin/user-management']);
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Registration failed',
            'Close',
            {
              duration: 3000,
            }
          );
          this.isLoading.set(false);
        },
      });
  }
}
