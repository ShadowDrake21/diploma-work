import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { CommentService } from '@core/services/comment.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { PaginatedResponse } from '@models/api-response.model';
import { IComment } from '@models/comment.types';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'profile-my-comments',
  imports: [
    MatPaginatorModule,
    DatePipe,
    MatCardModule,
    RouterLink,
    MatButtonModule,
    TruncateTextPipe,
  ],
  templateUrl: './my-comments.component.html',
})
export class MyCommentsComponent implements OnDestroy {
  private readonly commentService = inject(CommentService);
  private destroy$ = new Subject<void>();

  pageSize = signal(10);
  pageIndex = signal(0);

  comments = signal<PaginatedResponse<IComment>>(this.initialComments);

  ngOnInit() {
    this.loadComments();
  }

  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadComments();
  }

  private loadComments() {
    this.commentService
      .getCommentsByUserId(
        currentUserSig()?.id!,
        this.pageIndex(),
        this.pageSize()
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.comments.set(response);
      });
  }

  get initialComments() {
    return {
      success: true,
      data: [],
      page: 0,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      timestamp: new Date().toISOString(),
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
