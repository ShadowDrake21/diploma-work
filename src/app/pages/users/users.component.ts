import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';
import { IUser } from '@shared/models/user.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService } from '@core/services/users/user.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatListModule,
    MatChipsModule,
    UserCardComponent,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    LoaderComponent,
  ],
  templateUrl: './users.component.html',
  host: { style: 'height: 100%; display: block;' },
})
export class UsersComponent {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  searchControl = new FormControl('');

  users = signal<IUser[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);
  errorOccurred = signal(false);

  displayMessage = computed(() => {
    if (this.errorOccurred()) {
      return 'Failed to load users. Please try again later.';
    }
    if (this.searchQuery()) {
      return `Search results for: "${this.searchQuery()}": ${
        this.users().length
      } of ${this.totalItems()} users found`;
    }
    return `All Users: ${this.totalItems()}`;
  });

  searchQuery$ = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  constructor() {
    effect(() => {
      const query = this.searchQuery$();
      untracked(() => {
        this.searchQuery.set(query || '');
        this.currentPage.set(0);
        this.loadUsers();
      });
    });
  }

  private loadUsers(): void {
    this.errorOccurred.set(false);

    if (this.users().length === 0) {
      this.isLoading.set(true);
    }

    const request = this.searchQuery()
      ? this.userService.searchUsers(
          this.searchQuery(),
          this.currentPage(),
          this.pageSize()
        )
      : this.userService.getPaginatedUsers(this.currentPage(), this.pageSize());

    request.subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalItems.set(response.totalItems);
        this.currentPage.set(response.page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading.set(false);
        this.errorOccurred.set(true);
        this.notificationService.showError(
          'Failed to load users. Please try again later.'
        );
      },
    });
  }

  reloadUsers(): void {
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
    this.loadUsers();
  }
}
