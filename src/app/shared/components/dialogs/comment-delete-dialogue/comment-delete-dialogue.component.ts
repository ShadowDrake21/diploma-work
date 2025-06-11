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
  template: `
    <h2 mat-dialog-title>Delete comment</h2>
    <mat-dialog-content>
      Would you like to delete this comment?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false" cdkFocusInitial>No</button>
      <button mat-button [mat-dialog-close]="true">Yes</button>
    </mat-dialog-actions>
  `,
})
export class CommentDeleteDialogueComponent {
  readonly dialogRef = inject(MatDialogRef<CommentDeleteDialogueComponent>);
}
