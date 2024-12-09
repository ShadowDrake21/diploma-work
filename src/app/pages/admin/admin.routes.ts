import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin.component').then((c) => c.AdminComponent),
    children: [
      {
        path: 'content',
        loadComponent: () =>
          import('./components/content/content.component').then(
            (c) => c.ContentComponent
          ),
      },
      {
        path: 'manage-users',
        loadComponent: () =>
          import('./components/manage-users/manage-users.component').then(
            (c) => c.ManageUsersComponent
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./components/roles/roles.component').then(
            (c) => c.RolesComponent
          ),
      },
    ],
  },
];
