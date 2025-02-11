import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecoverPasswordRoutes } from './recover-password.routes';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(RecoverPasswordRoutes)],
})
export class RecoverPasswordModule {}
