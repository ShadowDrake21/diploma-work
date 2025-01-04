import { Routes } from '@angular/router';

export const ProjectsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings.component').then((m) => m.SettingsComponent),
    children: [
      {
        path: 'general',
        loadComponent: () =>
          import(
            './components/general-settings/general-settings.component'
          ).then((m) => m.GeneralSettingsComponent),
      },
      {
        path: 'system',
        loadComponent: () =>
          import('./components/system-settings/system-settings.component').then(
            (m) => m.SystemSettingsComponent
          ),
      },
      {
        path: 'research',
        loadComponent: () =>
          import(
            './components/research-settings/research-settings.component'
          ).then((m) => m.ResearchSettingsComponent),
      },
      {
        path: 'reporting',
        loadComponent: () =>
          import(
            './components/reporting-settings/reporting-settings.component'
          ).then((m) => m.ReportingSettingsComponent),
      },
      {
        path: 'data-management',
        loadComponent: () =>
          import(
            './components/data-management-settings/data-management-settings.component'
          ).then((m) => m.DataManagementSettingsComponent),
      },
      {
        path: 'advanced',
        loadComponent: () =>
          import(
            './components/advanced-settings/advanced-settings.component'
          ).then((m) => m.AdvancedSettingsComponent),
      },
    ],
  },
];
