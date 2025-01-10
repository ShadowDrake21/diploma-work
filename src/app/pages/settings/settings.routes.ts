import { Routes } from '@angular/router';

export const SettingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings.component').then((m) => m.SettingsComponent),
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      {
        path: 'general',
        loadComponent: () =>
          import(
            './components/general-settings/general-settings.component'
          ).then((m) => m.GeneralSettingsComponent),
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
    ],
  },
];
