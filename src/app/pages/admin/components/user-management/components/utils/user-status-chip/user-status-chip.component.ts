import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-user-status-chip',
  imports: [CommonModule, MatChipsModule],
  template: `
    <mat-chip [color]="active ? 'primary' : 'warn'">
      {{ active ? 'Active' : 'Inactive' }}
    </mat-chip>
  `,
  styles: `
  mat-chip{
    font-weight: 500;
  }
  `,
})
export class UserStatusChipComponent {
  @Input() active = false;
}
