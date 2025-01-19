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
        path: 'data-management',
        loadComponent: () =>
          import('./components/data-management/data-management.component').then(
            (c) => c.DataManagementComponent
          ),
      },
      {
        path: 'users-managements',
        loadComponent: () =>
          import(
            './components/users-management/users-management.component'
          ).then((c) => c.UsersManagementComponent),
      },
      {
        path: 'monotoring-analytics',
        loadComponent: () =>
          import(
            './components/monitoring-analytics/monitoring-analytics.component'
          ).then((c) => c.MonitoringAnalyticsComponent),
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
