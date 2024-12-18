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
import { Router, RouterLink } from '@angular/router';
import { map, merge, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { matchValidator } from '../../validators/match.validator';
import {
  getFieldName,
  getValidationErrorMessage,
} from '../../../../shared/utils/form.utils';
import { CustomButtonComponent } from '../../../../shared/components/custom-button/custom-button.component';

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
