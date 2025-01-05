import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { SettingsRoutes } from './settings.routes';

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(SettingsRoutes)],
})
export class SettingsModule {}
