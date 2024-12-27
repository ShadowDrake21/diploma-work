import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-recent-project-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './recent-project-dialog.component.html',
  styleUrl: './recent-project-dialog.component.scss',
})
export class RecentProjectDialogComponent {}
