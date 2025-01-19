import { Component, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { PaginationService } from '@core/services/pagination.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { IComment } from '@shared/types/comment.types';

@Component({
  selector: 'shared-comment',
  imports: [MatIcon, TimeAgoPipe],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
})
export class CommentComponent {
  commentSig = input.required<IComment>({ alias: 'comment' });
}
