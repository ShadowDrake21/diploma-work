import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { UserService } from '@core/services/users/user.service';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';
import { RecentUsersService } from '@core/services/users/recent-users.service';

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
export class OnlineUsersComponent {
  private readonly recentUsersService = inject(RecentUsersService);

  get activeUsers() {
    return this.recentUsersService.activeUsers()?.data || [];
  }

  refreshActiveUsers() {
    this.recentUsersService.refreshActiveUsers();
  }
}
