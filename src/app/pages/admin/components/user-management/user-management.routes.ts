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
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/user-list/user-list.component').then(
            (c) => c.UserListComponent
          ),
        canActivate: [adminGuard],
        data: { title: 'User Management' },
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
