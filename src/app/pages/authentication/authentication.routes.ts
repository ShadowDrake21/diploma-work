import { Routes } from '@angular/router';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./authentication.component').then(
        (c) => c.AuthenticationComponent
      ),
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./components/sign-in/sign-in.component').then(
            (c) => c.SignInComponent
          ),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./components/sign-up/sign-up.component').then(
            (c) => c.SignUpComponent
          ),
      },
      {
        path: 'verification-code',
        loadComponent: () =>
          import(
            './components/verification-code/verification-code.component'
          ).then((c) => c.VerificationCodeComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./components/reset-password/reset-password.component').then(
            (c) => c.ResetPasswordComponent
          ),
      },
    ],
  },
];
