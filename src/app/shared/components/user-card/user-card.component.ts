import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { IUser } from '@shared/models/user.model';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'shared-user-card',
  imports: [MatButton, MatDividerModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  private router = inject(Router);
  user = input.required<IUser>();

  goToProfile() {
    this.router.navigate(['/users', this.user().id]);
  }
}
