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
import { IComment } from '@shared/types/comment.types';
import { ConfirmDialogComponent } from '@pages/admin/components/user-management/components/dialogs/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseFormComponent } from '../../../../../../shared/abstract/base-form/base-form.component';

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
  ],
  templateUrl: './comments-table.component.html',
  styleUrl: './comments-table.component.scss',
})
export class CommentsTableComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly _snackBar = inject(MatSnackBar);

  displayedColumns: string[] = [
    'content',
    'author',
    'projectId',
    'likes',
    'createdAt',
    'actions',
  ];

  comments = signal<IComment[]>([]);
  isLoading = signal<boolean>(false);
  totalItems = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments() {
    this.isLoading.set(true);
    this.adminService
      .loadAllComments(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.comments.set(response.data);
          this.totalItems.set(response.totalItems);
          this.isLoading.set(false);
        },
        error: () => {
          this.openSnackBar('Error loading comments');
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading.set(true);
        this.adminService.deleteComment(commentId).subscribe({
          next: () => {
            this.openSnackBar('Comment deleted successfully');
            this.loadComments();
          },
          error: () => {
            this.openSnackBar('Failed to delete comment');
            this.isLoading.set(false);
          },
        });
      }
    });
  }

  viewReplies(comment: IComment) {
    // Implement view replies functionality
    console.log('View replies for comment:', comment.id);
  }

  private openSnackBar(message: string, action: string = 'Close') {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }
}
