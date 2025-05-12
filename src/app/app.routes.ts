import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { notAuthGuard } from '@core/guards/not-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'authentication',
    loadChildren: () =>
      import('./pages/authentication/authentication.module').then(
        (c) => c.AuthenticationModule
      ),
    canActivate: [notAuthGuard],
  },
  {
    path: 'projects',
    loadChildren: () =>
      import('./pages/projects/projects.module').then((c) => c.ProjectsModule),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.module').then((c) => c.AdminModule),
    canActivate: [authGuard],
  },
  {
    path: 'my-profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  // {
  //   path: 'my-comments',
  //   loadComponent: () =>
  //     import('./pages/comments/comments.component').then(
  //       (c) => c.CommentsComponent
  //     ),
  //   canActivate: [authGuard],
  // },
  {
    path: 'settings',
    loadChildren: () =>
      import('./pages/settings/settings.module').then((c) => c.SettingsModule),
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./pages/notifications/notifications.component').then(
        (c) => c.NotificationsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users.component').then((c) => c.UsersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./pages/user/user.component').then((c) => c.UserComponent),
    canActivate: [authGuard],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: 'not-found' },
];
