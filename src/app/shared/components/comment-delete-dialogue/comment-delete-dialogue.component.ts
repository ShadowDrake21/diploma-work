import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-comment-delete-dialogue',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
  ],
  templateUrl: './comment-delete-dialogue.component.html',
  styleUrl: './comment-delete-dialogue.component.scss',
})
export class CommentDeleteDialogueComponent {
  readonly dialogRef = inject(MatDialogRef<CommentDeleteDialogueComponent>);
}
