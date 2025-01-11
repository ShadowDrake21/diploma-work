import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { notifications } from '@content/notifications.content';
import { INotification } from '@shared/types/notifications.types';

@Component({
  selector: 'modal-notification-item',
  imports: [CommonModule, MatDialogModule, MatIcon, MatButton],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.scss',
})
export class NotificationItemComponent implements OnInit {
  private router = inject(Router);
  dialog = inject(MatDialog);

  idSig = input.required<string | null>({ alias: 'id' });
  notificationItem: INotification | undefined = undefined;

  ngOnInit(): void {
    this.fetchNotificationItem();
  }

  fetchNotificationItem() {
    if (!this.idSig()) return;

    this.notificationItem = notifications.find(
      (notification) => notification.id === this.idSig()
    );
  }

  onMarkAsRead() {
    console.log('Mark as read');
  }

  onItemAction() {
    if (!this.notificationItem) return;

    this.dialog.closeAll();
    this.router.navigate([this.notificationItem.action.link]);
  }

  onViewAll() {
    this.dialog.closeAll();
    this.router.navigate(['/notifications']);
  }
}
