import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { INotification } from '@shared/types/notifications.types';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { notifications } from '@content/notifications.content';

@Component({
  selector: 'sidebar-notifications',
  imports: [CommonModule, MatIcon, RouterLink, DatePipe, TruncateTextPipe],
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
