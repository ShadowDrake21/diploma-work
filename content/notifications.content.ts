import { INotification } from '@shared/types/notifications.types';

export const notifications: INotification[] = [
  {
    id: '1',
    title: 'New Message', // Brief title
    message: 'You have received a new message from John.',
    type: 'info',
    timestamp: '2024-12-25T10:30:00Z',
    isRead: false,
    action: {
      label: 'View Message',
      link: '/messages/123',
    },
    category: 'Messages',
    priority: 'medium',
    tags: ['deadline', 'report', 'high'],
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
    category: 'Deadlines',
    priority: 'high',
    tags: ['deadline', 'report', 'high'],
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
    category: 'Tasks',
    priority: 'low',
    tags: ['deadline', 'report', 'high'],
  },
  {
    id: '4',
    title: 'System Update',
    message: 'A new system update is available. Please update your software.',
    type: 'info',
    timestamp: '2024-12-22T08:00:00Z',
    isRead: false,
    action: {
      label: 'Update Now',
      link: '/settings/system-update',
    },
    priority: 'high',
    category: 'System Alerts',
    tags: ['system', 'update', 'info'],
  },
  {
    id: '5',
    title: 'Unusual Login Attempt',
    message: 'An unrecognized device tried logging into your account.',
    type: 'error',
    timestamp: '2024-12-21T19:15:00Z',
    isRead: false,
    action: {
      label: 'Review Activity',
      link: '/security/logins',
    },
    priority: 'high',
    category: 'Security',
    tags: ['security', 'login', 'error'],
  },
];
