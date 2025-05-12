// import { Component, input } from '@angular/core';
// import { MatIcon } from '@angular/material/icon';
// import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
// import { IComment } from '@shared/types/comment.types';

// @Component({
//   selector: 'shared-comment',
//   imports: [MatIcon, TimeAgoPipe],
//   templateUrl: './comment.component.html',
//   styleUrl: './comment.component.scss',
// })
// export class CommentComponent {
//   commentSig = input.required<IComment>({ alias: 'comment' });
// }

// comment.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@core/authentication/auth.service';
import { CommentDeleteDialogueComponent } from '../comment-delete-dialogue/comment-delete-dialogue.component';
import { MatButtonModule } from '@angular/material/button';
import { IComment } from '@shared/types/comment.types';
import { set } from 'date-fns';

@Component({
  selector: 'shared-comment',
  imports: [FormsModule, CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  private authService = inject(AuthService);

  @Input() comment!: IComment;
  @Input() isReply = false;
  @Output() reply = new EventEmitter<string>();
  @Output() like = new EventEmitter<['like' | 'unlike', string]>();
  @Output() edit = new EventEmitter<{ id: string; content: string }>();
  @Output() delete = new EventEmitter<string>();

  isEditing = false;
  isLiking = false;
  editedContent = '';
  currentUserId = this.authService.getCurrentUserId();

  onReply() {
    this.reply.emit(this.comment.id);
  }

  onLikeToggle() {
    if (this.isLiking) return;
    if (this.comment.userId === this.currentUserId) return;

    this.isLiking = true;

    const likeAction = this.comment.isLikedByCurrentUser
      ? this.like.emit(['unlike', this.comment.id])
      : this.like.emit(['like', this.comment.id]);

    setTimeout(() => (this.isLiking = false), 2000);
  }

  onEdit() {
    this.isEditing = true;
    this.editedContent = this.comment.content;
  }

  onSave() {
    this.edit.emit({ id: this.comment.id, content: this.editedContent });
    this.isEditing = false;
  }

  onCancel() {
    this.isEditing = false;
  }

  // onDelete() {

  //   // this.delete.emit(this.comment.id);
  // }

  isCurrentUserComment(): boolean {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) return false;
    return currentUserId === this.comment.userId;
  }

  readonly dialog = inject(MatDialog);

  onDelete(): void {
    const dialogRef = this.dialog.open(CommentDeleteDialogueComponent, {
      width: '300px',
    });

    dialogRef
      .afterClosed()
      .subscribe((result) => result && this.delete.emit(this.comment.id));
  }
}
