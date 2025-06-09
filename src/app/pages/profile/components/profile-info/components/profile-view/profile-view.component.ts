import { DatePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '@core/services/notification.service';
import { IUser, SocialLink } from '@models/user.model';

@Component({
  selector: 'profile-view',
  imports: [MatButtonModule, DatePipe],
  templateUrl: './profile-view.component.html',
})
export class ProfileViewComponent {
  private readonly notificationService = inject(NotificationService);

  user = input.required<IUser>();
  edit = output<void>();

  get socialLinks(): SocialLink[] {
    try {
      return this.user().socialLinks || [];
    } catch (error) {
      console.error('Error getting social links:', error);
      return [];
    }
  }
  onEdit(): void {
    try {
      this.edit.emit();
    } catch (error) {
      this.notificationService.showError('Failed to enter edit mode');
      console.error('Error emitting edit event:', error);
    }
  }
}
