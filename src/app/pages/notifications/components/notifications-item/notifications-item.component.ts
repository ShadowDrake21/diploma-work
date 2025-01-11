import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { INotification } from '@shared/types/notifications.types';
@Component({
  selector: 'notifications-item',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatListModule,
    MatChipsModule,
  ],
  templateUrl: './notifications-item.component.html',
  styleUrl: './notifications-item.component.scss',
})
export class NotificationsItemComponent {
  notificationItemSig = input.required<INotification>({
    alias: 'notificationItem',
  });

  onMarkAsRead() {
    console.log('Mark as read');
  }

  onItemAction() {
    console.log('Item action');
  }

  onItemDelete() {
    console.log('Item delete');
  }
}
