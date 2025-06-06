import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { SharedRecentUsersBase } from '@pages/dashboard/components/abstract/shared-recent-users-base/shared-recent-users-base.component';

@Component({
  selector: 'dashboard-online-users',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    UserCardComponent,
  ],
  templateUrl: './online-users.component.html',
  styleUrl: './online-users.component.scss',
})
export class OnlineUsersComponent extends SharedRecentUsersBase {}
