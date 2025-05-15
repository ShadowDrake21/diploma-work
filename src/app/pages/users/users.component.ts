import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';
import { PaginationService } from '@core/services/pagination.service';
import { IUser } from '@shared/models/user.model';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { UserService } from '@core/services/user.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageResponse } from '@shared/types/generics.types';

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
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  providers: [PaginationService],
  host: { style: 'height: 100%; display: block;' },
})
export class UsersComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');

  private userService = inject(UserService);

  users: IUser[] = [];
  isLoading = false;
  searchQuery: string = '';

  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initLoading();
    this.setupSearch();
  }

  private initLoading(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.loadUsers();
    }, 1000);
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery = query || '';
        this.currentPage = 0;
        this.loadUsers();
      });
  }

  private loadUsers(page: number = this.currentPage): void {
    if (this.users.length === 0) {
      this.isLoading = true;
    }

    const request$ = this.searchQuery
      ? this.userService.searchUsers(this.searchQuery, page, this.pageSize)
      : this.userService.getPaginatedUsers(page, this.pageSize);

    const sub = request$.subscribe({
      next: (response) => {
        this.handleLoadingResponse(response);
        setTimeout(() => (this.isLoading = false), 100);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      },
    });

    this.subscriptions.push(sub);
  }

  private handleLoadingResponse(response: PageResponse<IUser>): void {
    this.users = response.data;
    this.totalItems = response.totalItems;
    this.currentPage = response.page;
    this.isLoading = false;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadUsers();
  }

  get displayMessage(): string {
    if (this.searchQuery) {
      return `Search results for: "${this.searchQuery}": ${this.users.length} of ${this.totalItems} users found`;
    }
    return `All Users: ${this.totalItems}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
