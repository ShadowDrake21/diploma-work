import { NgModule } from '@angular/core';
import { ProjectsRoutes } from './projects.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(ProjectsRoutes)],
  exports: [],
  providers: [],
})
export class ProjectsModule {}
