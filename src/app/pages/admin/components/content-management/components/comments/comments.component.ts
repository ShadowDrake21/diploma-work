import { Component, inject, OnInit } from '@angular/core';
import { PaginationService } from '@core/services/pagination.service';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'admin-comments',
  imports: [CommentComponent, PaginationComponent, MatButtonModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
  providers: [PaginationService, provideNativeDateAdapter()],
})
export class CommentsComponent implements OnInit {
  paginationService = inject(PaginationService);

  pages: number[] = [];
  // comments = userComments;

  ngOnInit(): void {
    this.paginationUsage();
  }

  editComment(id: any) {}

  deleteComment(id: any) {}

  paginationUsage() {
    this.paginationService.currentPage = 1;
    // this.paginationService.elements = this.comments;
    this.paginationService.itemsPerPage = 7;
    this.paginationService.updateVisibleElements();

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }
}
