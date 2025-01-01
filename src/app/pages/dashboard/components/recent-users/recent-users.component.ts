import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TruncateTextPipe } from '../../../../shared/pipes/truncate-text.pipe';

@Component({
  selector: 'sidebar-recent-users',
  imports: [CommonModule, MatIcon, TruncateTextPipe],
  templateUrl: './recent-users.component.html',
  styleUrl: './recent-users.component.scss',
})
export class RecentUsersComponent {
  recentUsers = [
    {
      id: '1', // Unique ID for the user
      name: 'Amelia Kastelik', // User's full name
      avatar: '/recent-users/user-1.jpg', // Path to user's profile picture
      role: 'user', // Role of the user (e.g., admin, user)
      lastActive: '2024-12-24T14:30:00Z', // Timestamp of last activity
    },
    {
      id: '2',
      name: 'Dmytro Krapyvianskyi',
      avatar: '/recent-users/user-2.jpg',
      role: 'admin',
      lastActive: '2024-12-24T13:45:00Z',
    },
    {
      id: '3',
      name: 'Paulo Dybala',
      avatar: '/recent-users/user-3.jpg',
      role: 'user',
      lastActive: '2024-12-23T18:20:00Z',
    },
  ];
}
