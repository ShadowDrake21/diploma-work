import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
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
