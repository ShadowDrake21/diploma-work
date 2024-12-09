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
    loadComponent: () =>
      import('./pages/authentication/authentication.component').then(
        (c) => c.AuthenticationComponent
      ),
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import(
            './pages/authentication/components/sign-in/sign-in.component'
          ).then((c) => c.SignInComponent),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import(
            './pages/authentication/components/sign-up/sign-up.component'
          ).then((c) => c.SignUpComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import(
            './pages/authentication/components/reset-password/reset-password.component'
          ).then((c) => c.ResetPasswordComponent),
      },
    ],
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/projects/projects.component').then(
        (c) => c.ProjectsComponent
      ),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./pages/project-details/project-details.component').then(
        (c) => c.ProjectDetailsComponent
      ),
  },
  {
    path: 'create-project',
    loadComponent: () =>
      import('./pages/create-project/create-project.component').then(
        (c) => c.CreateProjectComponent
      ),
  },
  {
    path: 'update-project/:id',
    loadComponent: () =>
      import('./pages/update-project/update-project.component').then(
        (c) => c.UpdateProjectComponent
      ),
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
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((c) => c.AdminComponent),
    children: [
      {
        path: 'content',
        loadChildren: () =>
          import('./pages/admin/components/content/content.component').then(
            (c) => c.ContentComponent
          ),
      },
      {
        path: 'manage-users',
        loadChildren: () =>
          import(
            './pages/admin/components/manage-users/manage-users.component'
          ).then((c) => c.ManageUsersComponent),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./pages/admin/components/roles/roles.component').then(
            (c) => c.RolesComponent
          ),
      },
    ],
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
