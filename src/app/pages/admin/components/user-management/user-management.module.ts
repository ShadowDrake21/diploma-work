import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserManagementRoutes } from './user-management.routes';

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(UserManagementRoutes)],
  exports: [],
  providers: [],
})
export class AdminModule {}
