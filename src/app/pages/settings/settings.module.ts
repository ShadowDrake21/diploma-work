import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { ProjectsRoutes } from './settings.routes';

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(ProjectsRoutes)],
})
export class SettingsModule {}
