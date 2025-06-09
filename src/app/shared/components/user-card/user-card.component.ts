import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { IUser } from '@shared/models/user.model';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { RoleFormatPipe } from '@pipes/role-format.pipe';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';

@Component({
  selector: 'shared-user-card',
  imports: [MatButton, MatDividerModule, RoleFormatPipe, TruncateTextPipe],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  private readonly router = inject(Router);
  user = input.required<IUser>();

  goToProfile() {
    this.router.navigate(['/users', this.user().id]);
  }
}
