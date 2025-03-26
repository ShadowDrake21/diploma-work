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
import { AuthService } from '@core/authentication/auth.service';
import { CommentInterface } from '@shared/types/comment.types';

@Component({
  selector: 'shared-comment',
  imports: [FormsModule, CommonModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  private authService = inject(AuthService);

  @Input() comment!: CommentInterface;
  @Input() isReply = false;
  @Output() reply = new EventEmitter<string>();
  @Output() like = new EventEmitter<string>();
  @Output() edit = new EventEmitter<{ id: string; content: string }>();
  @Output() delete = new EventEmitter<string>();

  isEditing = false;
  editedContent = '';

  onReply() {
    this.reply.emit(this.comment.id);
  }

  onLike() {
    this.like.emit(this.comment.id);
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

  onDelete() {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.delete.emit(this.comment.id);
    }
  }

  isCurrentUserComment(): boolean {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) return false;
    return currentUserId === this.comment.userId;
  }
}
