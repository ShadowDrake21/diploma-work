import { Routes } from '@angular/router';

export const UserManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-management.component').then(
        (c) => c.UserManagementComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/user-list/user-list.component').then(
            (c) => c.UserListComponent
          ),
        data: { title: 'User Management' },
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./components/user-details/user-details.component').then(
            (c) => c.UserDetailsComponent
          ),
        data: { title: 'User Details' },
      },
    ],
  },
];
