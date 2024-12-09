import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthenticationRoutes } from './authentication.routes';

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(AuthenticationRoutes)],
  exports: [],
  providers: [],
})
export class AuthenticationModule {}
