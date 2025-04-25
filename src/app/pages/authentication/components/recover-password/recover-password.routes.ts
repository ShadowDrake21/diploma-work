import { Routes } from '@angular/router';

export const RecoverPasswordRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./recover-password.component').then(
        (m) => m.RecoverPasswordComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'forgot-password',
        pathMatch: 'full',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./components/forgot-password/forgot-password.component').then(
            (c) => c.ForgotPasswordComponent
          ),
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
