import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommentService } from '@core/services/comment.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { PaginatedResponse } from '@models/api-response.model';
import { IComment } from '@models/comment.types';

@Component({
  selector: 'profile-my-comments',
  imports: [MatPaginatorModule, DatePipe, MatCardModule],
  templateUrl: './my-comments.component.html',
  styleUrl: './my-comments.component.scss',
})
export class MyCommentsComponent {
  private readonly commentService = inject(CommentService);

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
      timestamp: new Date(),
    };
  }
}
