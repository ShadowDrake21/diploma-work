import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { map, merge, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { matchValidator } from '../../validators/match.validator';

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
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  destroyRef = inject(DestroyRef);

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
    },
    {
      validators: matchValidator('password', 'confirmPassword'),
    }
  );

  onSignUp() {
    console.log('onSignUp', this.signUpForm.value);
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
    let errorMessage = '';

    if (control.hasError('required')) {
      errorMessage = `${this.getFieldName(key)} is required.`;
    } else if (control.hasError('minlength')) {
      errorMessage = `${this.getFieldName(key)} must be at least ${
        control.errors?.['minlength'].requiredLength
      } characters long.`;
    } else if (control.hasError('maxlength')) {
      errorMessage = `${this.getFieldName(key)} cannot exceed ${
        control.errors?.['maxlength'].requiredLength
      } characters.`;
    } else if (key === 'email' && control.hasError('email')) {
      errorMessage = 'Please enter a valid email address.';
    } else if (
      key === 'confirmPassword' &&
      control.hasError('confirmedValidator')
    ) {
      errorMessage = 'Passwords do not match.';
    }

    this.errorMessages[key].set(errorMessage);
  }

  private getFieldName(key: keyof SignUpForm): string {
    switch (key) {
      case 'name':
        return 'Name';
      case 'email':
        return 'Email';
      case 'password':
        return 'Password';
      case 'confirmPassword':
        return 'Confirm Password';
      default:
        return '';
    }
  }
}
