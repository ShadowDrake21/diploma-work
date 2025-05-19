import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { UserRole } from '@shared/enums/user.enum';

@Component({
  selector: 'app-user-role-chip',
  imports: [CommonModule, MatChipsModule],
  template: `
    <mat-chip [color]="getColor()"> {{ role() | titlecase }} </mat-chip>
  `,
  styles: ``,
})
export class UserRoleChipComponent {
  role = input<UserRole>(UserRole.USER);

  getColor(): string {
    switch (this.role()) {
      case UserRole.ADMIN:
        return 'accent';
      case UserRole.SUPER_ADMIN:
        return 'primary';
      default:
        return '';
    }
  }
}
