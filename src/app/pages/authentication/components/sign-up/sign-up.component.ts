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
import { RouterLink } from '@angular/router';
import { map, merge, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type signUpForm = {
  firstName: string;
  lastName: string;
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

  protected signUpForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(25),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(25),
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
  });

  ngOnInit(): void {
    const controls = Object.values(this.signUpForm.controls);
    merge(
      ...controls.map((control) =>
        merge(control.statusChanges, control.valueChanges)
      )
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((control) => {
        console.log('control', control);
        const controlWithError = this.getControlWithError();

        if (controlWithError) this.updateErrorMessages(controlWithError);
      });
  }

  errorMessage = signal<signUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  onSignUp() {}

  getControlWithError() {
    const form = this.signUpForm;

    for (const controlName in form.controls) {
      for (const controlName of Object.keys(
        form.controls
      ) as (keyof typeof form.controls)[]) {
        return controlName;
      }
    }

    return null;
  }

  updateErrorMessages(controlName: string) {
    const form = this.signUpForm;

    // Helper function to determine the error message for a control
    const getErrorMessage = (controlName: string): string => {
      const control = form.get(controlName);

      if (control?.hasError('required')) {
        return `${controlName} is required`;
      }
      if (control?.hasError('minlength')) {
        return `${controlName} must be at least ${control?.errors?.['minlength'].requiredLength} characters`;
      }
      if (control?.hasError('maxlength')) {
        return `${controlName} must be less than ${control?.errors?.['maxlength'].requiredLength} characters`;
      }
      if (control?.hasError('email')) {
        return 'Please enter a valid email address';
      }
      if (
        controlName === 'confirmPassword' &&
        control?.value !== form.get('password')?.value
      ) {
        return 'Passwords do not match';
      }
      return '';
    };

    // Update the specific error message for the control
    this.errorMessage.set({
      ...this.errorMessage(),
      [controlName]: getErrorMessage(controlName),
    });
  }
}
