import { Routes } from '@angular/router';

export const ProjectsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./projects.component').then((c) => c.ProjectsComponent),
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () =>
          import('./components/list/list.component').then(
            (c) => c.ListProjectsComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./components/create/create.component').then(
            (c) => c.CreateProjectComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/details/details.component').then(
            (c) => c.ProjectDetailsComponent
          ),
        runGuardsAndResolvers: 'always',
      },
    ],
  },
];
