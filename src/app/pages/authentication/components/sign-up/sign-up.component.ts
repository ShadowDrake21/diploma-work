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
      validators: this.matchValidator('password', 'confirmPassword'),
    }
  );

  matchValidator(
    controlName: string,
    matchingControlName: string
  ): ValidatorFn {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(controlName);
      const matchingControl = abstractControl.get(matchingControlName);

      if (
        matchingControl!.errors &&
        !matchingControl!.errors?.['confirmedValidator']
      ) {
        return null;
      }

      if (control!.value !== matchingControl!.value) {
        const error = { confirmedValidator: 'Passwords do not match.' };
        matchingControl!.setErrors(error);
        return error;
      } else {
        matchingControl!.setErrors(null);
        return null;
      }
    };
  }

  ngOnInit(): void {
    merge(
      this.signUpForm.controls.name.statusChanges,
      this.signUpForm.controls.name.statusChanges
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateNameErrorMessage());
    merge(
      this.signUpForm.controls.email.statusChanges,
      this.signUpForm.controls.email.statusChanges
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateEmailErrorMessage());
    merge(
      this.signUpForm.controls.password.statusChanges,
      this.signUpForm.controls.password.statusChanges
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updatePasswordErrorMessage());
    merge(
      this.signUpForm.controls.confirmPassword.statusChanges,
      this.signUpForm.controls.confirmPassword.statusChanges
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateConfirmPasswordErrorMessage());
  }

  errorNameMessage = signal<string>('');
  errorEmailMessage = signal<string>('');
  errorPasswordMessage = signal<string>('');
  errorConfirmPasswordMessage = signal<string>('');

  onSignUp() {
    console.log('onSignUp', this.signUpForm.value);
  }

  updateNameErrorMessage() {
    const control = this.signUpForm.controls.name;

    this.errorNameMessage.set(
      control.hasError('required')
        ? 'Name is required'
        : control.hasError('minlength')
        ? 'Name must be at least 3 characters long'
        : control.hasError('maxlength')
        ? 'Name cannot exceed 30 characters'
        : ''
    );
  }

  updateEmailErrorMessage() {
    const control = this.signUpForm.controls.email;

    this.errorEmailMessage.set(
      control.hasError('required')
        ? 'Email is required'
        : control.hasError('email')
        ? 'Invalid email address'
        : ''
    );
  }

  updatePasswordErrorMessage() {
    const control = this.signUpForm.controls.password;

    this.errorPasswordMessage.set(
      control.hasError('required')
        ? 'Password is required'
        : control.hasError('minlength')
        ? 'Password must be at least 6 characters long'
        : control.hasError('maxlength')
        ? 'Password cannot exceed 30 characters'
        : ''
    );
  }

  updateConfirmPasswordErrorMessage() {
    const control = this.signUpForm.controls.confirmPassword;

    this.errorConfirmPasswordMessage.set(
      control.hasError('required')
        ? 'Confirm Password is required'
        : control.hasError('confirmedValidator')
        ? 'Passwords do not match'
        : ''
    );
  }
}
