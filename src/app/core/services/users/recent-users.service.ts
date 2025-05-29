import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap, catchError, of } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RecentUsersService {
  private readonly userService = inject(UserService);

  activeUsers = toSignal(
    interval(60000).pipe(
      startWith(null),
      switchMap(() => this.userService.getRecentlyActiveUsers()),
      catchError((error) => {
        console.error('Error fetching active users: ', error);
        return of(null);
      })
    ),
    { initialValue: null }
  );

  refreshActiveUsers() {
    this.activeUsers = toSignal(this.userService.getRecentlyActiveUsers(), {
      initialValue: null,
    });
  }
}
