import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@core/authentication/auth.service';
import { CommentDeleteDialogueComponent } from '../dialogs/comment-delete-dialogue/comment-delete-dialogue.component';
import { MatButtonModule } from '@angular/material/button';
import { IComment } from '@models/comment.types';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'shared-comment',
  imports: [
    FormsModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  readonly comment = input.required<IComment>();
  readonly isReply = input(false);

  readonly reply = output<string>();
  readonly like = output<['like' | 'unlike', string]>();
  readonly edit = output<{ id: string; content: string }>();
  readonly delete = output<string>();

  readonly isEditing = signal(false);
  readonly isLiking = signal(false);
  readonly editedContent = signal('');

  readonly currentUserId = toSignal(
    this.authService.currentUser$.pipe(map((user) => user?.userId))
  );

  readonly isCurrentUserComment = computed(() => {
    const userId = this.currentUserId();
    return userId ? userId === this.comment().userId : false;
  });

  onReply() {
    this.reply.emit(this.comment().id);
  }

  onLikeToggle() {
    if (this.isLiking() || this.isCurrentUserComment()) return;

    this.isLiking.set(true);
    const action = this.comment().isLikedByCurrentUser ? 'unlike' : 'like';
    this.like.emit([action, this.comment().id]);

    setTimeout(() => this.isLiking.set(false), 2000);
  }

  onEdit() {
    this.isEditing.set(true);
    this.editedContent.set(this.comment().content);
  }

  onSave() {
    this.edit.emit({
      id: this.comment().id,
      content: this.editedContent(),
    });
    this.isEditing.set(false);
  }

  onCancel() {
    this.isEditing.set(false);
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(CommentDeleteDialogueComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.delete.emit(this.comment().id);
      }
    });
  }
}
