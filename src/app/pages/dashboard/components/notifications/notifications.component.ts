import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { INotification } from '../../../../shared/types/notifications.types';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TruncateTextPipe } from '../../../../shared/pipes/truncate-text.pipe';

@Component({
  selector: 'sidebar-notifications',
  imports: [CommonModule, MatIcon, RouterLink, DatePipe, TruncateTextPipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  notifications: INotification[] = [
    {
      id: '1', // Unique identifier for the notification
      title: 'New Message', // Brief title
      message: 'You have received a new message from John.', // Detailed message
      type: 'info', // Type of notification ('info', 'warning', 'success', 'error')
      timestamp: '2024-12-25T10:30:00Z', // Time the notification was created
      isRead: false, // Boolean to track if the notification has been read
      action: {
        label: 'View Message', // Label for the action button
        link: '/messages/123', // Link or callback for the action
      },
      priority: 'medium', // Priority level ('high', 'medium', 'low')
    },
    {
      id: '2',
      title: 'Deadline Reminder',
      message: 'Your project report is due tomorrow at 5 PM.',
      type: 'warning',
      timestamp: '2024-12-24T09:00:00Z',
      isRead: false,
      action: {
        label: 'Submit Now',
        link: '/projects/submit',
      },
      priority: 'high',
    },
    {
      id: '3',
      title: 'Task Completed',
      message: 'The task "Design Mockup" has been marked as completed.',
      type: 'success',
      timestamp: '2024-12-23T15:45:00Z',
      isRead: true,
      action: {
        label: 'View Details',
        link: '/tasks/456',
      },
      priority: 'low',
    },
  ];
}
