import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  interval,
  startWith,
  switchMap,
  catchError,
  of,
  Observable,
} from 'rxjs';
import { UserService } from './user.service';
import { NotificationService } from '../notification.service';
import { IUser } from '@models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RecentUsersService {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  activeUsers = toSignal(
    interval(60000).pipe(
      startWith(null),
      switchMap(() => this.getActiveUsersWithHandling()),
      catchError((error) => {
        this.handleActiveUsersError(error);
        return of({ error: this.createErrorObject(error) });
      })
    ),
    { initialValue: null }
  );

  refreshActiveUsers() {
    this.activeUsers = toSignal(
      this.getActiveUsersWithHandling().pipe(
        catchError((error) => {
          this.handleActiveUsersError(error);
          return of({ error: this.createErrorObject(error) });
        })
      ),
      {
        initialValue: null,
      }
    );
  }

  private getActiveUsersWithHandling(): Observable<IUser[] | null> {
    return this.userService.getRecentlyActiveUsers().pipe(
      catchError((error) => {
        this.handleActiveUsersError(error);
        return of(null);
      })
    );
  }

  private handleActiveUsersError(error: any): void {
    console.error('Error fetching active users:', error);
    this.notificationService.showError(
      error.status === 403
        ? 'You do not have permission to view active users'
        : 'Failed to load active users'
    );
  }

  private createErrorObject(error: any): { message: string } {
    return {
      message:
        error.status === 403
          ? 'You do not have permission to view active users'
          : 'Failed to load active users',
    };
  }
}
