import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IComment } from '@models/comment.types';
import { ConfirmDialogComponent } from '@pages/admin/components/user-management/components/dialogs/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '@core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, retry, Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-comments-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DatePipe,
    TruncateTextPipe,
    LoaderComponent,
  ],
  templateUrl: './comments-table.component.html',
})
export class CommentsTableComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly observer = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [
    'content',
    'author',
    'projectTitle',
    'likes',
    'createdAt',
    'actions',
  ];

  comments = signal<IComment[]>([]);
  isLoading = signal<boolean>(false);
  totalItems = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  error = signal<string | null>(null);
  isMobile = signal(true);

  ngOnInit(): void {
    this.loadComments();

    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile.set(false);
      } else {
        this.isMobile.set(true);
      }
    });
  }

  loadComments() {
    this.error.set(null);
    this.isLoading.set(true);

    this.adminService
      .loadAllComments(this.currentPage(), this.pageSize())
      .pipe(
        retry(2),
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.comments.set(response.data ?? []);
          this.totalItems.set(response.totalItems);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Не вдалося завантажити коментарі');
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadComments();
  }

  deleteComment(commentId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Видалити коментар',
        message: 'Ви впевнені, що хочете видалити цей коментар?',
        confirmText: 'Видалити',
        cancelText: 'Скасувати',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.executeDeleteComment(commentId);
      }
    });
  }

  executeDeleteComment(commentId: string) {
    this.error.set(null);
    this.isLoading.set(true);

    this.adminService
      .deleteComment(commentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Коментар успішно видалено');
          this.loadComments();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Не вдалося видалити коментар');
          this.isLoading.set(false);
        },
      });
  }

  viewReplies(comment: IComment) {
    console.log('View replies for comment:', comment.id);
  }

  handleError(error: HttpErrorResponse, defaultMessage: string): void {
    const errorMessage = this.getErrorMessage(error, defaultMessage);
    this.error.set(errorMessage);
    this.notificationService.showError(errorMessage);
    console.error('Error:', error);
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    defaultMessage: string
  ): string {
    if (error.status === 403) {
      return 'У вас немає дозволу на виконання цієї дії';
    }
    if (error.status === 404) {
      return 'Коментар не знайдено';
    }
    if (error.status === 409) {
      return 'Неможливо видалити коментар із відповідями';
    }
    return defaultMessage;
  }

  refreshComments(): void {
    this.currentPage.set(0);
    this.loadComments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
