import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { IUser } from '@shared/types/users.types';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'shared-user-card',
  imports: [MatIcon, MatButton, DatePipe, MatDividerModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  userSig = input.required<IUser>({ alias: 'user' });
}
