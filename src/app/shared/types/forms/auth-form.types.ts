import { WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserRole } from '@shared/enums/user.enum';

export interface SignUpForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  role: FormControl<UserRole>;
}

export type SignUpErrorMessages = {
  name: WritableSignal<string>;
  email: WritableSignal<string>;
  password: WritableSignal<string>;
  confirmPassword: WritableSignal<string>;
};

export interface SignInForm {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

export type SignInFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type SignInErrorMessages = {
  email: WritableSignal<string>;
  password: WritableSignal<string>;
};
