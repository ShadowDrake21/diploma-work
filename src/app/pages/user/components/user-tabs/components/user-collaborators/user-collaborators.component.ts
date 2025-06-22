import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { IUser } from '@shared/models/user.model';
import { catchError, of, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'user-collaborators',
  imports: [
    CommonModule,
    UserCardComponent,
    MatListModule,
    MatPaginatorModule,
    MatProgressBarModule,
  ],
  templateUrl: './user-collaborators.component.html',
})
export class UserCollaboratorsComponent implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  userId = input.required<number>();

  collaborators = signal<IUser[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const userId = this.userId();
      if (userId) {
        this.loadCollaborators(userId, this.currentPage(), this.pageSize());
      }
    });
  }

  private loadCollaborators(userId: number, page: number, size: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService
      .getUserCollaborators(userId, page, size)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.error.set('Не вдалося завантажити співавторів');
          this.notificationService.showError(
            'Не вдалося завантажити співавторів'
          );
          console.error('Error loading collaborators:', error);
          return of({
            data: [],
            totalItems: 0,
            page: 0,
            totalPages: 0,
            hasNext: false,
          });
        })
      )
      .subscribe({
        next: (response) => {
          this.collaborators.set(response.data!);
          this.totalItems.set(response.totalItems);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCollaborators(this.userId(), event.pageIndex, event.pageSize);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
