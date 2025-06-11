import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'admin-navigation',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navigation.component.html',
})
export class NavigationComponent {
  navItems = [
    { path: 'dashboard', icon: 'dashboard', label: 'Інформаційна панель' },
    {
      path: 'content-management',
      icon: 'folder',
      label: 'Управління контентом',
    },
    {
      path: 'users-management',
      icon: 'groups',
      label: 'Керування користувачами',
    },
  ];
}
