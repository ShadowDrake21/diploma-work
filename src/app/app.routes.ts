import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/user/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
  },
  {
    path: 'authentication',
    loadChildren: () =>
      import('./pages/authentication/authentication.module').then(
        (c) => c.AuthenticationModule
      ),
  },
  {
    path: 'projects',
    loadChildren: () =>
      import('./pages/projects/projects.module').then((c) => c.ProjectsModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.module').then((c) => c.AdminModule),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (c) => c.SettingsComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
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
