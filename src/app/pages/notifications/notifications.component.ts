import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { notifications } from '@content/notifications.content';
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
import { Filter } from '@shared/types/filters.types';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationsItemComponent } from './components/notifications-item/notifications-item.component';

@Component({
  selector: 'app-notifications',
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
    NotificationsItemComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  notifications = notifications;
  searchControl = new FormControl('', Validators.required);
  filterControl = new FormControl('unread', Validators.required);

  searchFilters: Filter[] = [
    {
      value: 'unread',
      viewValue: 'Unread',
    },
    {
      value: 'info',
      viewValue: 'Info',
    },
    {
      value: 'warning',
      viewValue: 'Warning',
    },
    {
      value: 'high-priority',
      viewValue: 'High priority',
    },
  ];

  onMarkAll() {}

  onClearAll() {}
}
