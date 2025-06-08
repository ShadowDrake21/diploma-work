import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IComment } from '@models/comment.types';
import { ConfirmDialogComponent } from '@pages/admin/components/user-management/components/dialogs/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseFormComponent } from '../../../../../../shared/abstract/base-form/base-form.component';
import { NotificationService } from '@core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { retry } from 'rxjs';
import { LoaderComponent } from '../../../../../../shared/components/loader/loader.component';

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
  styleUrl: './comments-table.component.scss',
})
export class CommentsTableComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly notificationService = inject(NotificationService);

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

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments() {
    this.error.set(null);
    this.isLoading.set(true);

    this.adminService
      .loadAllComments(this.currentPage(), this.pageSize())
      .pipe(retry(2))
      .subscribe({
        next: (response) => {
          this.comments.set(response.data ?? []);
          this.totalItems.set(response.totalItems);
          this.isLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Failed to load comments');
          this.isLoading.set(false);
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
        title: 'Delete Comment',
        message: 'Are you sure you want to delete this comment?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.executeDeleteComment(commentId);
      }
    });
  }

  private executeDeleteComment(commentId: string) {
    this.error.set(null);
    this.isLoading.set(true);

    this.adminService.deleteComment(commentId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Comment deleted successfully');
        this.loadComments();
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error, 'Failed to delete comment');
        this.isLoading.set(false);
      },
    });
  }

  viewReplies(comment: IComment) {
    // Implement view replies functionality
    console.log('View replies for comment:', comment.id);
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
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
      return 'You do not have permission to perform this action';
    }
    if (error.status === 404) {
      return 'Comment not found';
    }
    if (error.status === 409) {
      return 'Cannot delete comment with replies';
    }
    return defaultMessage;
  }

  refreshComments(): void {
    this.currentPage.set(0);
    this.loadComments();
  }
}
