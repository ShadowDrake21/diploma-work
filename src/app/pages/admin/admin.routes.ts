import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin.component').then((c) => c.AdminComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
      {
        path: 'content-management',
        loadComponent: () =>
          import(
            './components/content-management/content-management.component'
          ).then((c) => c.ContentManagementComponent),
      },
      {
        path: 'users-management',
        loadChildren: () =>
          import('./components/user-management/user-management.routes').then(
            (r) => r.UserManagementRoutes
          ),
      },
    ],
  },
];
