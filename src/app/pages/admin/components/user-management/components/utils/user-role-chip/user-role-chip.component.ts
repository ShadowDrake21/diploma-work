import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { RoleFormatPipe } from '@pipes/role-format.pipe';
import { UserRole } from '@shared/enums/user.enum';

@Component({
  selector: 'app-user-role-chip',
  imports: [CommonModule, MatChipsModule, RoleFormatPipe],
  template: `
    <mat-chip [color]="getColor()">
      {{ role() | titlecase | roleFormat }}
    </mat-chip>
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
