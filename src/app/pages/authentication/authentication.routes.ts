import { Routes } from '@angular/router';
import { adminInviteGuard } from '@core/guards/admin-invite.guard';
import { adminSignUpCompleteGuard } from '@core/guards/admin-sign-up-complete.guard';
import { notAuthGuard } from '@core/guards/not-auth.guard';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./authentication.component').then(
        (c) => c.AuthenticationComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full',
      },
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
        path: 'recover-password',
        loadChildren: () =>
          import('./components/recover-password/recover-password.module').then(
            (m) => m.RecoverPasswordModule
          ),
      },
      {
        path: 'admin-sign-up',
        loadChildren: () =>
          import('./components/admin-sign-up/admin-sign-up.component').then(
            (m) => m.AdminSignUpComponent
          ),
        canActivate: [notAuthGuard, adminInviteGuard, adminSignUpCompleteGuard],
      },
    ],
  },
];
