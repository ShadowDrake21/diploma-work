import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { IUser, SocialLink } from '@models/user.model';

@Component({
  selector: 'profile-view',
  imports: [MatButtonModule, DatePipe],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss',
})
export class ProfileViewComponent {
  user = input.required<IUser>();
  edit = output<void>();

  get socialLinks(): SocialLink[] {
    if (!this.user().socialLinks) return [];
    return this.user().socialLinks || [];
  }
  onEdit(): void {
    this.edit.emit();
  }
}
