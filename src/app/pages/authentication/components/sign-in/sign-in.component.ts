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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { getValidationErrorMessage } from '@shared/utils/form.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';

type SignInForm = {
  email: string;
  password: string;
};
@Component({
  selector: 'auth-sign-in',
  imports: [
    FormsModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    CustomButtonComponent,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  destroyRef = inject(DestroyRef);

  protected signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });

  errorMessages = {
    email: signal<string>(''),
    password: signal<string>(''),
  };

  ngOnInit(): void {
    Object.entries(this.signInForm.controls).forEach(([key, control]) => {
      if (key !== 'rememberMe') {
        control.statusChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.updateErrorMessage(key as keyof SignInForm));
      }
    });
  }

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSignIn() {
    console.log('sign in');
    console.log(this.signInForm.value);
  }

  updateErrorMessage(key: keyof SignInForm) {
    const control = this.signInForm.controls[key];
    this.errorMessages[key].set(getValidationErrorMessage(control, key));
  }
}
