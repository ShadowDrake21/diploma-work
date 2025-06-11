import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  interval,
  startWith,
  switchMap,
  catchError,
  of,
  Observable,
  take,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { UserService } from './user.service';
import { NotificationService } from '../notification.service';
import { IUser } from '@models/user.model';
import { AuthService } from '@core/authentication/auth.service';

interface ErrorResult {
  error: {
    message: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class RecentUsersService implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  private _activeUsers = signal<IUser[] | ErrorResult | null>(null);
  public activeUsers = this._activeUsers.asReadonly();

  constructor() {
    this.setupPolling();
  }

  private setupPolling(): void {
    interval(60000)
      .pipe(
        startWith(0),
        switchMap(() => this.fetchActiveUsers()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  refreshActiveUsers() {
    this.fetchActiveUsers().pipe(takeUntil(this.destroy$)).subscribe();
  }

  private fetchActiveUsers(): Observable<IUser[] | null> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) return of(null);
        return this.userService.getRecentlyActiveUsers().pipe(
          tap((users) => this._activeUsers.set(users)),
          catchError((error) => {
            const errorResult: ErrorResult = {
              error: {
                message:
                  error.status === 403
                    ? 'У вас немає дозволу на перегляд активних користувачів'
                    : 'Не вдалося завантажити активних користувачів',
              },
            };
            this._activeUsers.set(errorResult);
            this.notificationService.showError(errorResult.error.message);
            return of(null);
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
