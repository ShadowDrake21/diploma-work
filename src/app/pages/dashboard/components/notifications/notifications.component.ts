import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { notifications } from '@content/notifications.content';

@Component({
  selector: 'sidebar-notifications',
  imports: [CommonModule, MatIcon, DatePipe, TruncateTextPipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  dialog = inject(MatDialog);

  notifications = notifications;

  openNotification(id: string) {
    this.dialog.open(ModalComponent, {
      data: {
        type: 'notification',
        id,
      },
    });
  }
}
