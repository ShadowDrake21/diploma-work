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
import { UserService } from '@core/services/user.service';
import { interval, switchMap } from 'rxjs';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-online-users',
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
  private readonly userService = inject(UserService);

  activeUsers = toSignal(
    interval(60000).pipe(
      switchMap(() => this.userService.getRecentlyActiveUsers())
    )
  );

  refreshActiveUsers() {
    this.activeUsers = toSignal(this.userService.getRecentlyActiveUsers());
  }

  displayedColumns: string[] = ['username', 'email', 'lastActive'];
}
