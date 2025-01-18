import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { userComments } from '@content/userComments.content';
import { PaginationService } from '@core/services/pagination.service';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-comments',
  imports: [CommonModule, CommentComponent, PaginationComponent],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
  providers: [PaginationService],
})
export class CommentsComponent {
  paginationService = inject(PaginationService);

  comments = userComments;

  pages: number[] = [];

  ngOnInit(): void {
    this.paginationUsage();
  }

  paginationUsage() {
    this.paginationService.currentPage = 1;
    this.paginationService.elements = this.comments;
    this.paginationService.itemsPerPage = 7;
    this.paginationService.updateVisibleElements();

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }
}
