import { Routes } from '@angular/router';
import { adminGuard } from './components/guards/admin.guard';

export const UserManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-management.component').then(
        (c) => c.UserManagementComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user-list' },
      {
        path: 'users-list',
        loadComponent: () =>
          import('./components/user-list/user-list.component').then(
            (c) => c.UserListComponent
          ),
        canActivate: [adminGuard],
        data: { title: 'User Management' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./components/admin-user-form/admin-user-form.component').then(
            (c) => c.AdminUserFormComponent
          ),
        canActivate: [adminGuard],
        data: { title: 'Create Admin' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/user-details/user-details.component').then(
            (c) => c.UserDetailsComponent
          ),
        canActivate: [adminGuard],
        data: { title: 'User Details' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/user-form/user-form.component').then(
            (c) => c.UserFormComponent
          ),
        canActivate: [adminGuard],
        data: { title: 'Edit User' },
      },
      {
        path: 'invitations',
        loadComponent: () =>
          import('./components/invitation-list/invitation-list.component').then(
            (c) => c.InvitationListComponent
          ),
        canActivate: [adminGuard],
        data: { title: 'Admin Invitations' },
      },
    ],
  },
];
