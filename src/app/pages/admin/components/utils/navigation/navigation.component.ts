import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'admin-navigation',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  navItems = [
    { path: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    {
      path: 'content-management',
      icon: 'folder',
      label: 'Content Management',
    },
    { path: 'users-management', icon: 'groups', label: 'User Management' },
  ];
}
