import { Routes } from '@angular/router';

export const ProjectsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./projects.component').then((c) => c.ProjectsComponent),
    children: [
      {
        path: 'create',
        loadComponent: () =>
          import('./components/create/create.component').then(
            (c) => c.CreateProjectComponent
          ),
      },
      {
        path: 'update',
        loadComponent: () =>
          import('./components/update/update.component').then(
            (c) => c.UpdateProjectComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/details/details.component').then(
            (c) => c.ProjectDetailsComponent
          ),
      },
    ],
  },
];
