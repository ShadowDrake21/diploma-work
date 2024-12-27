import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecentProjectDialogComponent } from '../recent-project-dialog/recent-project-dialog.component';

@Component({
  selector: 'app-recent-project',
  imports: [CommonModule],
  templateUrl: './recent-project.component.html',
  styleUrl: './recent-project.component.scss',
})
export class RecentProjectComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    const dialogRef = this.dialog.open(RecentProjectDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
