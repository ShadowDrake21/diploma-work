import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { IUser } from '@shared/types/users.types';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'shared-user-card',
  imports: [MatIcon, MatButton, DatePipe, MatDividerModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  private router = inject(Router);
  userSig = input.required<IUser>({ alias: 'user' });

  goToProfile() {
    this.router.navigate(['/users', this.userSig().id]);
  }
}
