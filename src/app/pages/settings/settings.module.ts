import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsRoutes } from './settings.routes';

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(SettingsRoutes)],
})
export class SettingsModule {}
